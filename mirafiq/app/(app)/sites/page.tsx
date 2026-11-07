import { Card, CardBody, CardHead, Notice, PageHead } from "@/components/ui";

export default function Page() {
  return (
    <>
      <PageHead title="المواقع" sub="اسم الموقع والعميل." />

      <div className="u-stack">
        <Notice title="قيد البناء — حزمة العمل الثانية">
          التأسيس انتهى. هذه الشاشة تُبنى في الحزمة القادمة على نفس المكوّنات المشتركة.
        </Notice>

        <Card>
          <CardHead title="ما سيُبنى هنا" />
          <CardBody>
            <ul className="page-sub" style={{ paddingInlineStart: "18px", margin: 0 }}>
            <li>جدول المواقع</li>
            <li>إضافة موقع</li>
            <li>تعديل موقع</li>
            <li>عدد المهام المفتوحة لكل موقع</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
