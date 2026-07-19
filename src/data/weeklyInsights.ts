export interface WeeklyInsight {
  id: string;
  title: string;
  generatedAt: string;
  summary: string;
  markdown: string;
}

export const weeklyInsights: WeeklyInsight[] = [
  {
    id: 'week-current',
    title: 'Báo cáo chăm sóc tuần này',
    generatedAt: new Date().toISOString(),
    summary: 'Nhật ký chăm sóc ổn định, cần chú ý bổ sung ảnh thực tế khi ghi nhận sâu bệnh.',
    markdown: `## Tóm tắt tuần này
- Hoạt động chăm sóc được duy trì đều, tập trung vào tưới nước và quan sát lá.
- Nhật ký có nội dung tốt nhưng nên bổ sung ảnh khi phát hiện dấu hiệu lạ.
- Nhắc nhở nên đặt theo từng nhóm việc: tưới nước, bón phân, kiểm tra sâu bệnh.

## Gợi ý tuần tới
- Chụp ảnh mặt dưới lá ít nhất 2 lần/tuần.
- Ghi rõ giai đoạn sinh trưởng khi tạo nhật ký.
- Hoàn thành nhắc nhở đúng giờ để Bé Thóc cập nhật XP chính xác.`,
  },
  {
    id: 'week-previous',
    title: 'Báo cáo chăm sóc tuần trước',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'Tuần trước có nhiều hoạt động tưới nước, chưa có dữ liệu quét sâu bệnh.',
    markdown: `## Điểm nổi bật
- Tần suất tưới nước ổn định.
- Chưa có ảnh scan sâu bệnh để đối chiếu.

## Cần cải thiện
- Thêm ảnh vào timeline nhật ký.
- Đặt lịch nhắc bón phân theo mùa vụ cụ thể.`,
  },
];
