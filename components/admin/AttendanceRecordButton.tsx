"use client";

interface LessonRecord {
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: string;
  notes: string | null;
}

interface AttendanceRecordButtonProps {
  studentName: string;
  packageName: string;
  totalLessons: number;
  lessons: LessonRecord[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date: string | null) {
  if (!date) return "Not recorded";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatStatus(status: string) {
  switch (status) {
    case "completed":
      return "Completed";

    case "scheduled":
      return "Scheduled";

    case "rescheduled":
      return "Rescheduled / Credit";

    case "unexpected":
      return "Unexpected Circumstance";

    case "teacher_cancelled":
      return "Teacher Cancellation";

    default:
      return status;
  }
}

export default function AttendanceRecordButton({
  studentName,
  packageName,
  totalLessons,
  lessons,
}: AttendanceRecordButtonProps) {
  function generateRecord() {
    const completedLessons = lessons.filter(
      (lesson) =>
        lesson.attendance_status === "completed"
    ).length;

    const remainingLessons = Math.max(
      totalLessons - completedLessons,
      0
    );

    const rows = lessons
      .map(
        (lesson) => `
          <tr>
            <td class="lesson-number">
              ${lesson.lesson_number}
            </td>

            <td>
              ${escapeHtml(
                formatDate(lesson.lesson_date)
              )}
            </td>

            <td>
              ${lesson.duration ?? "—"} minutes
            </td>

            <td>
              <span class="status status-${lesson.attendance_status}">
                ${escapeHtml(
                  formatStatus(
                    lesson.attendance_status
                  )
                )}
              </span>
            </td>
          </tr>
        `
      )
      .join("");

    const safeStudentName =
      escapeHtml(studentName);

    const safePackageName =
      escapeHtml(packageName);

    const generatedDate =
      new Date().toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups in your browser to generate the attendance record."
      );

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="en">

        <head>

          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            Attendance Record - ${safeStudentName}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 48px;
              background: #ffffff;
              color: #292929;

              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            .document {
              max-width: 850px;
              margin: 0 auto;
            }

            /* -------------------------------------------------------------- */
            /* HEADER                                                         */
            /* -------------------------------------------------------------- */

            .header {
              padding-bottom: 28px;
              border-bottom: 1px solid #e7ddd1;
            }

            .brand {
              color: #6f8f72;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              font-size: 12px;
              font-weight: 600;

              letter-spacing: 0.12em;
              text-transform: uppercase;
            }

            .tagline {
              margin-top: 7px;

              color: #999;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              font-size: 10px;
              letter-spacing: 0.04em;
            }

            .document-label {
              margin-top: 34px;

              color: #6f8f72;

              font-size: 10px;
              font-weight: 600;

              letter-spacing: 0.14em;
              text-transform: uppercase;
            }

            h1 {
              margin: 8px 0 0;

              color: #292929;

              font-family:
                Georgia,
                "Times New Roman",
                serif;

              font-size: 36px;
              font-weight: 400;
              letter-spacing: -0.025em;
            }

            .student {
              margin-top: 10px;

              color: #555;

              font-size: 15px;
            }

            .package {
              margin-top: 4px;

              color: #888;

              font-size: 13px;
            }

            /* -------------------------------------------------------------- */
            /* SUMMARY                                                        */
            /* -------------------------------------------------------------- */

            .summary {
              display: grid;

              grid-template-columns:
                repeat(3, 1fr);

              gap: 12px;

              margin-top: 30px;
            }

            .summary-card {
              padding: 17px;

              border: 1px solid #e7ddd1;
              border-radius: 12px;

              background: #faf8f5;
            }

            .summary-label {
              color: #888;

              font-size: 9px;
              font-weight: 600;

              letter-spacing: 0.1em;
              text-transform: uppercase;
            }

            .summary-value {
              margin-top: 7px;

              color: #292929;

              font-family:
                Georgia,
                "Times New Roman",
                serif;

              font-size: 24px;
              font-weight: 400;
            }

            /* -------------------------------------------------------------- */
            /* TABLE                                                          */
            /* -------------------------------------------------------------- */

            .table-section {
              margin-top: 36px;
            }

            .section-label {
              margin-bottom: 12px;

              color: #888;

              font-size: 9px;
              font-weight: 600;

              letter-spacing: 0.1em;
              text-transform: uppercase;
            }

            table {
              width: 100%;

              border-collapse: separate;
              border-spacing: 0;

              overflow: hidden;

              border: 1px solid #e7ddd1;
              border-radius: 12px;
            }

            th {
              padding: 12px;

              background: #f5f2ed;

              border-bottom: 1px solid #ddd4ca;

              color: #666;

              font-size: 9px;
              font-weight: 600;

              text-align: left;

              letter-spacing: 0.08em;
              text-transform: uppercase;
            }

            td {
              padding: 14px 12px;

              border-bottom: 1px solid #eee7df;

              color: #555;

              font-size: 12px;
            }

            tr:last-child td {
              border-bottom: none;
            }

            .lesson-number {
              color: #5f7f63;

              font-weight: 600;
            }

            /* -------------------------------------------------------------- */
            /* STATUS                                                         */
            /* -------------------------------------------------------------- */

            .status {
              display: inline-block;

              padding: 5px 9px;

              border-radius: 999px;

              font-size: 9px;
              font-weight: 600;

              white-space: nowrap;
            }

            .status-completed {
              background: #e2ebdd;
              color: #5f7f63;
            }

            .status-scheduled {
              background: #f3eee7;
              color: #777;
            }

            .status-rescheduled {
              background: #f3eee7;
              color: #777;
            }

            .status-unexpected {
              background: #f3eee7;
              color: #777;
            }

            .status-teacher_cancelled {
              background: #f3eee7;
              color: #777;
            }

            /* -------------------------------------------------------------- */
            /* FOOTER                                                         */
            /* -------------------------------------------------------------- */

            .footer {
              margin-top: 42px;
              padding-top: 22px;

              border-top: 1px solid #e7ddd1;
            }

            .footer-brand {
              color: #6f8f72;

              font-size: 11px;
              font-weight: 600;

              letter-spacing: 0.1em;
              text-transform: uppercase;
            }

            .footer-tagline {
              margin-top: 5px;

              color: #999;

              font-size: 10px;
            }

            .footer-note {
              margin-top: 16px;

              color: #888;

              font-size: 10px;
              line-height: 1.7;
            }

            .generated {
              margin-top: 4px;
            }

            /* -------------------------------------------------------------- */
            /* PRINT                                                          */
            /* -------------------------------------------------------------- */

            @media print {

              @page {
                margin: 18mm;
              }

              body {
                padding: 0;
              }

              .document {
                max-width: none;
              }

              table {
                break-inside: auto;
              }

              tr {
                break-inside: avoid;
              }

              .summary-card {
                break-inside: avoid;
              }

            }

            @media (max-width: 650px) {

              body {
                padding: 24px;
              }

              .summary {
                grid-template-columns: 1fr;
              }

              h1 {
                font-size: 30px;
              }

              th,
              td {
                padding: 10px 8px;
              }

            }

          </style>

        </head>

        <body>

          <div class="document">

            <!-- HEADER -->

            <header class="header">

              <div class="brand">
                Hamkke │ 함께
              </div>

              <div class="tagline">
                From Small Talks to Big Ideas
              </div>

              <div class="document-label">
                Student Record
              </div>

              <h1>
                Attendance Record
              </h1>

              <div class="student">
                ${safeStudentName}
              </div>

              <div class="package">
                ${safePackageName}
              </div>

            </header>

            <!-- SUMMARY -->

            <section class="summary">

              <div class="summary-card">

                <div class="summary-label">
                  Total Lessons
                </div>

                <div class="summary-value">
                  ${totalLessons}
                </div>

              </div>

              <div class="summary-card">

                <div class="summary-label">
                  Completed
                </div>

                <div class="summary-value">
                  ${completedLessons}
                </div>

              </div>

              <div class="summary-card">

                <div class="summary-label">
                  Remaining
                </div>

                <div class="summary-value">
                  ${remainingLessons}
                </div>

              </div>

            </section>

            <!-- LESSON RECORDS -->

            <section class="table-section">

              <div class="section-label">
                Lesson History
              </div>

              <table>

                <thead>

                  <tr>
                    <th>Lesson</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>
                  ${rows}
                </tbody>

              </table>

            </section>

            <!-- FOOTER -->

            <footer class="footer">

              <div class="footer-brand">
                Hamkke │ 함께
              </div>

              <div class="footer-tagline">
                From Small Talks to Big Ideas
              </div>

              <div class="footer-note">
                This attendance record reflects the lesson
                records maintained by Hamkke │ 함께.
                <div class="generated">
                  Generated on ${generatedDate}.
                </div>
              </div>

            </footer>

          </div>

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  return (
    <button
      type="button"
      onClick={generateRecord}
      className="
        inline-flex
        items-center
        justify-center
        rounded-full
        border
        border-[#D8CCBE]
        bg-white
        px-5
        py-3
        font-sans
        text-[12px]
        font-medium
        text-[#5F7F63]
        transition
        hover:border-[#6F8F72]
        hover:bg-[#F4F7F2]
      "
    >
      Generate Attendance Record
    </button>
  );
}