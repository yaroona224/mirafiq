import { Card, CardBody, CardHead, Notice, PageHead } from "@/components/ui";

export default function Page() {
  return (
    <>
      <PageHead title="الموظفون" sub="الاسم والجوال والوظيفة." />

      <div className="u-stack">
        <Notice title="قيد البناء — حزمة العمل الثانية">
          التأسيس انتهى. هذه الشاشة تُبنى في الحزمة القادمة على نفس المكوّنات المشتركة.
        </Notice>

        <Card>
          <CardHead title="ما سيُبنى هنا" />
          <CardBody>
            <ul className="page-sub" style={{ paddingInlineStart: "18px", margin: 0 }}>
            <li>جدول الموظفين</li>
            <li>إضافة موظف</li>
            <li>تعديل موظف</li>
            <li>تعطيل موظف (بدل الحذف)</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
