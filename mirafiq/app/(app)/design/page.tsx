"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHead,
  CodeBlock,
  EmptyRow,
  Input,
  KindChip,
  Notice,
  PageHead,
  Pill,
  Select,
  StatusPill,
  Table,
} from "@/components/ui";
import { TASK_KINDS, TASK_STATUSES, type TaskStatus } from "@/lib/types";

/**
 * مرجع المكوّنات المشتركة.
 * قبل بناء أي شاشة جديدة: خذ المكوّن من هنا ولا تكتب تنسيقاً جديداً.
 */
export default function DesignPage() {
  const [status, setStatus] = useState<TaskStatus>("جديد");
  const [text, setText] = useState("");

  function cycle() {
    const i = TASK_STATUSES.indexOf(status);
    setStatus(TASK_STATUSES[(i + 1) % TASK_STATUSES.length]);
  }

  return (
    <>
      <PageHead
        title="المكوّنات المشتركة"
        sub="كل شاشة في النظام تُبنى من هذه العناصر فقط."
      />

      <div className="u-stack">
        <Notice title="القاعدة الوحيدة">
          ممنوع كتابة لون أو نصف قطر داخل أي شاشة. كل شيء من المتغيّرات في
          {" "}<code className="u-mono">app/globals.css</code>. لو احتجت مكوّناً جديداً، أضفه في
          {" "}<code className="u-mono">components/ui.tsx</code> ليستخدمه الفريق كله.
        </Notice>

        <Card>
          <CardHead title="الأزرار" />
          <CardBody>
            <div className="u-row">
              <Button>رئيسي</Button>
              <Button variant="secondary">ثانوي</Button>
              <Button variant="ghost">شفّاف</Button>
              <Button variant="danger">حذف</Button>
              <Button disabled>معطّل</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="الحقول" />
          <CardBody>
            <div className="form-grid">
              <Input
                label="حقل نصّي"
                name="demo_text"
                placeholder="اكتب شيئاً"
                value={text}
                onChange={(e) => setText(e.target.value)}
                hint="تلميح تحت الحقل"
              />
              <Input
                label="حقل فيه خطأ"
                name="demo_error"
                defaultValue="قيمة غير صحيحة"
                error="هذا الحقل إلزامي"
              />
              <Select label="قائمة منسدلة" name="demo_select" options={TASK_KINDS} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead
            title="الحالات والأنواع"
            extra={<Pill tone="neutral">اضغط الحالة</Pill>}
          />
          <CardBody>
            <div className="u-row u-mb">
              <StatusPill status={status} onClick={cycle} />
              {TASK_STATUSES.map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </div>
            <div className="u-row">
              {TASK_KINDS.map((k) => (
                <KindChip key={k} kind={k} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="جدول" />
          <Table>
            <thead>
              <tr>
                <th>الرقم</th>
                <th>المهمة</th>
                <th>الموقع</th>
                <th>النوع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="u-mono">WO-2026-0418</span>
                </td>
                <td className="table-strong">استبدال مرشحات وحدة التكييف AHU-03</td>
                <td className="table-dim">مجمع العيادات الخارجية</td>
                <td>
                  <KindChip kind="وقائية" />
                </td>
                <td>
                  <StatusPill status="جاري" />
                </td>
              </tr>
              <tr>
                <td>
                  <span className="u-mono">WO-2026-0419</span>
                </td>
                <td className="table-strong">تسريب مياه في دورة مياه الدور الأرضي</td>
                <td className="table-dim">مبنى الإدارة العامة</td>
                <td>
                  <KindChip kind="طارئة" />
                </td>
                <td>
                  <StatusPill status="جديد" />
                </td>
              </tr>
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHead title="جدول فارغ" />
          <Table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الوظيفة</th>
              </tr>
            </thead>
            <tbody>
              <EmptyRow colSpan={2} text="لا توجد بيانات بعد." />
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHead title="التنبيهات" />
          <CardBody>
            <div className="u-stack">
              <Notice title="معلومة">نبرة عادية.</Notice>
              <Notice tone="warn" title="تحذير">شيء يحتاج انتباهاً.</Notice>
              <Notice tone="crit" title="خطأ">فشل الحفظ.</Notice>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="كتلة كود" />
          <CardBody>
            <CodeBlock>{`import { Button } from "@/components/ui";\n\n<Button onClick={save}>حفظ</Button>`}</CodeBlock>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
