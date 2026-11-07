import { Card, CardBody, CardHead, Notice, PageHead } from "@/components/ui";

export default function Page() {
  return (
    <>
      <PageHead title="المهام" sub="أوامر العمل: الوصف والموقع والمسؤول والحالة." />

      <div className="u-stack">
        <Notice title="قيد البناء — حزمة العمل الثانية">
          التأسيس انتهى. هذه الشاشة تُبنى في الحزمة القادمة على نفس المكوّنات المشتركة.
        </Notice>

        <Card>
          <CardHead title="ما سيُبنى هنا" />
          <CardBody>
            <ul className="page-sub" style={{ paddingInlineStart: "18px", margin: 0 }}>
            <li>جدول المهام مع الربط بالموظفين والمواقع</li>
            <li>إضافة مهمة</li>
            <li>تغيير الحالة: جديد ← جاري ← منتهي</li>
            <li>الفلترة بالحالة مع العدّادات</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
