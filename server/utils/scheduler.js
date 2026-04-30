const cron = require('node-cron');
const Card = require('../models/Card');
const createNotification = require('./createNotification');

// 매시간 정각에 실행
cron.schedule('0 * * * *', async () => {
  console.log('⏰ [Scheduler] 마감 임박 카드 체크 시작...');
  
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    // 한국 시간 기준 오늘 00:00부터 내일까지
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const urgentCards = await Card.find({
      due_date: { $gte: startOfToday, $lte: tomorrow },
      status: { $ne: '완료' },
      is_notified: false
    });

    if (urgentCards.length === 0) {
      console.log('✅ 마감 임박 카드가 없습니다.');
      return;
    }

    for (const card of urgentCards) {
      await createNotification({
        user_id: card.owner_id,
        category: 'DEADLINE',
        type: 'deadline_approaching',
        title: '마감 임박 알림',
        content: `'${card.title}' 카드의 마감 시간이 24시간 이내로 남았습니다!`,
        link_url: `/board/${card.board_id}`
      });

      card.is_notified = true;
      await card.save();
      
      console.log(`🔔 [알림 발송 완료] 카드 제목: ${card.title}`);
    }
  } catch (error) {
    console.error('❌ [Scheduler] 에러 발생:', error.message);
  }
});