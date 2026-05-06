import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import PDFDocument from 'pdfkit';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd   = endOfMonth(now);

    // Fetch ALL expenses so charts always have data even from old CSVs
    const [allExpenses, monthExpenses] = await Promise.all([
      prisma.expense.findMany({ where: { userId } }),
      prisma.expense.findMany({
        where: { userId, date: { gte: currentMonthStart, lte: currentMonthEnd } },
      }),
    ]);

    // Use all-time data for charts; month data for the "this month" total
    const expenses = allExpenses;
    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const allTimeTotal = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const categoryPercentages = Object.keys(categoryBreakdown).reduce((acc: any, key) => {
      acc[key] = allTimeTotal > 0
        ? ((categoryBreakdown[key] / allTimeTotal) * 100).toFixed(1)
        : '0';
      return acc;
    }, {});

    // Daily trends — last 30 days of data
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentExpenses = allExpenses.filter(e => e.date >= thirtyDaysAgo);
    const dailyTrends = recentExpenses.reduce((acc: any, exp) => {
      const dateStr = exp.date.toISOString().split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + exp.amount;
      return acc;
    }, {});

    res.status(200).json({
      totalSpent,       // current month
      allTimeTotal,     // all time
      categoryBreakdown,
      categoryPercentages,
      dailyTrends,
      transactionCount: allExpenses.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
};

export const runLeakDetection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Clear old insights for simplicity
    await prisma.insight.deleteMany({ where: { userId } });

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    const monthExpenses = expenses.filter(e => e.date >= currentMonthStart);
    const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const insights = [];

    // 1. Food Leak Detection (> 40% of total monthly spending)
    const foodTotal = monthExpenses.filter(e => e.category.toLowerCase().includes('food') || e.category.toLowerCase().includes('eat')).reduce((sum, e) => sum + e.amount, 0);
    if (totalMonthSpent > 0 && foodTotal > totalMonthSpent * 0.4) {
      insights.push({
        userId,
        message: 'High spending on food detected! Food consumes over 40% of your total monthly budget.',
        type: 'CRITICAL',
        category: 'LEAK',
        isAlert: true,
      });
    }

    // 2. Micro-spending Leak (> 10 transactions under ₹200 in a week)
    const weekExpenses = expenses.filter(e => e.date >= last7DaysStart);
    const smallTransactions = weekExpenses.filter(e => e.amount < 200);
    if (smallTransactions.length > 10) {
      insights.push({
        userId,
        message: `Frequent small expenses are adding up! You had ${smallTransactions.length} transactions under ₹200 this week.`,
        type: 'WARNING',
        category: 'LEAK',
        isAlert: true,
      });
    }

    // 3. Spending Spike (> 30% increase vs previous 7 days)
    const last7DaysTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const prev7DaysTotal = expenses.filter(e => e.date >= prev7DaysStart && e.date < last7DaysStart).reduce((sum, e) => sum + e.amount, 0);
    
    if (prev7DaysTotal > 0 && last7DaysTotal > prev7DaysTotal * 1.3) {
      const percentIncrease = ((last7DaysTotal - prev7DaysTotal) / prev7DaysTotal * 100).toFixed(0);
      insights.push({
        userId,
        message: `Spending Spike Detected! Your spending has increased by ${percentIncrease}% compared to the previous week.`,
        type: 'CRITICAL',
        category: 'SPIKE',
        isAlert: true,
      });
    }

    // 4. Time-based Pattern (Late-night hours 10PM - 4AM)
    const lateNightExpenses = monthExpenses.filter(e => {
      const hour = e.date.getHours();
      return hour >= 22 || hour <= 4;
    });
    if (lateNightExpenses.length > 3) {
      insights.push({
        userId,
        message: 'High spending during late-night hours detected. Late-night purchases often correlate with impulsive spending.',
        type: 'INFO',
        category: 'PATTERN',
        isAlert: false,
      });
    }

    // 5. Weekend vs Weekday Pattern
    const weekendExpenses = monthExpenses.filter(e => [0, 6].includes(e.date.getDay())).reduce((sum, e) => sum + e.amount, 0);
    const weekdayExpenses = monthExpenses.filter(e => ![0, 6].includes(e.date.getDay())).reduce((sum, e) => sum + e.amount, 0);
    if (weekendExpenses > weekdayExpenses * 0.8) { // Heuristic: high weekend spending
       const percentOfTotal = (weekendExpenses / (weekendExpenses + weekdayExpenses) * 100).toFixed(0);
       insights.push({
         userId,
         message: `You are spending ${percentOfTotal}% of your budget on weekends. Consider monitoring weekend leisure costs.`,
         type: 'INFO',
         category: 'PATTERN',
         isAlert: false,
       });
    }

    if (insights.length > 0) {
      await prisma.insight.createMany({ data: insights });
    }

    const generatedInsights = await prisma.insight.findMany({ where: { userId } });
    res.status(200).json(generatedInsights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run leak detection engine' });
  }
};

export const getPrediction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pastExpenses = await prisma.expense.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
    });

    const totalSpent = pastExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyAverage = totalSpent / 30;
    const predictedNextMonth = dailyAverage * 30;

    let confidence = 'LOW';
    if (pastExpenses.length > 20) confidence = 'HIGH';
    else if (pastExpenses.length > 10) confidence = 'MEDIUM';

    res.status(200).json({
      predictedAmount: predictedNextMonth || 0,
      confidence,
      message: `Based on your last 30 days activity, your projected spending is ₹${(predictedNextMonth || 0).toFixed(2)}.`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate real prediction' });
  }
};

export const downloadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);

    const expenses = await prisma.expense.findMany({
      where: { userId, date: { gte: currentMonthStart } },
      orderBy: { date: 'desc' }
    });
    
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const insights = await prisma.insight.findMany({ where: { userId } });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DataWallet_Report_${now.getMonth()+1}_${now.getFullYear()}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fillColor('#6366f1').fontSize(28).text('DataWallet', { align: 'left' });
    doc.fillColor('#444').fontSize(10).text('Student Financial Intelligence Platform', { align: 'left' });
    doc.moveDown();
    doc.strokeColor('#eee').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
    doc.moveDown();

    // Summary
    doc.fillColor('#000').fontSize(18).text(`Monthly Financial Analysis - ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`);
    doc.moveDown();
    
    doc.fontSize(14).text(`Total Expenditure: ₹${totalSpent.toFixed(2)}`, { indent: 20 });
    doc.moveDown();
    
    // Insights Section
    doc.fillColor('#6366f1').fontSize(16).text('Smart Leak Detection & Insights');
    doc.moveDown(0.5);
    
    if (insights.length === 0) {
      doc.fillColor('#666').fontSize(12).text('No critical leaks detected in the current period.', { indent: 20 });
    } else {
      insights.forEach(insight => {
        const color = insight.type === 'CRITICAL' ? '#ef4444' : insight.type === 'WARNING' ? '#f59e0b' : '#3b82f6';
        doc.fillColor(color).fontSize(11).text(`[${insight.category}] `, { continued: true, indent: 20 });
        doc.fillColor('#333').text(insight.message);
        doc.moveDown(0.2);
      });
    }
    
    doc.moveDown();

    // Category Breakdown
    const categories = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    doc.fillColor('#6366f1').fontSize(16).text('Expense Distribution');
    doc.moveDown(0.5);
    Object.keys(categories).forEach(cat => {
      const percent = ((categories[cat] / totalSpent) * 100).toFixed(1);
      doc.fillColor('#333').fontSize(11).text(`${cat}: ₹${categories[cat].toFixed(2)} (${percent}%)`, { indent: 20 });
    });

    doc.moveDown();
    
    // Recent Transactions
    doc.fillColor('#6366f1').fontSize(16).text('Recent Transactions Activity');
    doc.moveDown(0.5);
    expenses.slice(0, 15).forEach(exp => {
      doc.fillColor('#333').fontSize(10).text(`${exp.date.toISOString().split('T')[0]} | ${exp.category.padEnd(15)} | ₹${exp.amount.toFixed(2).padStart(10)} | ${exp.description || 'No description'}`, { indent: 20 });
    });

    // Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#999').fontSize(8).text(`Generated by DataWallet AI Engine on ${now.toLocaleString()}`, 50, 750, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate comprehensive PDF report' });
  }
};
