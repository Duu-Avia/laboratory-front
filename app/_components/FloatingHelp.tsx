"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleHelp, X, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useUser } from "@/lib/hooks/useUser";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

interface HelpItem {
  label: string;
  description?: string;
  steps?: string[];
  link?: string;
  roles?: string[];
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

const HELP_CONTENT: Record<string, HelpSection> = {
  "/": {
    title: 'Хэрэглэгчийн гарын авлага', 
    items: [
      {
        label: "Шинэ сорьц үүсгэх",
        steps: [
          "Дээд хэсгийн '+Сорьц шинээр оруулах' товчийг дарна",
          "Лабораторийн төрөл сонгоно",
          "Байршил сонгоно",
          "Сорьцын мэдээлэл оруулна",
          "Сорьцод санал болгосон үзүүлэлтүүдийн нягтлах, нэмэж хасах боломжтой ",
          "'Үүсгэх' товч дарж хадгална",
        ],
      },
      {
        label: "Тайлан хайх & шүүх",
        steps: [
          "Хүснэгтийн багана болгонд байрлах томруулдаг шилэн дээр дарж тухайн баганад хамаарсан шүүлт хийх боломжтой",
          "Төлөвөөр шүүхийн тулд Төлөв гэсэн мөрний баруун талд байрлах ▽ товч ашиглана",
          "'Түлхүүр үгээр хайх' хэсэгт тайлангийн дугаараар болон тайланд орсон сорьц, төлөвөөр ерөнхий шүүлт хийх боломжтой",
        ],
      },
      {
        label: "Тайлангийн төлөв ойлгох",
      steps: [
        "Сорьц хүлээгдэж байна - > Сорьц лабораторид ирсэн, шинжилгээ хийхэд бэлэн байна",
        "Шинжилгээ хийгдсэн ->Сонгогдсон тайланд шинжилгээ хийгдэж үр дүнг оруулж дууссан баталгаажуулалт хүсэж байна",
        "Шалгагдаж байна ->Бэлэн болсон тайлан нь шинжилгээ хийсэн хүнээр баталгаажсаны дараа тайланг хянах инженер шалгаж байна",
        "Буцаагдсан -> Шалгагдаж буй тайлан шинжилгээ дээр тайланг хянах инженер нягтлах явцад тайлан дээр алдаа илэрч буцаасан" ,
        "Дутуу ->Шинжилгээний үр дүнг дутуу оруулсан"]
      },
      {
        label: "Тайлан засах",
        steps: [
          "Сонгосон тайлан дээр дарж PDF хувилбараар дэлгэрэнгүй харна",
          "Тайлан засах товч дарна",
          "Мэдээллээ өөрчилнө",
          "Хадгалах товч дарна",
        ],
      },
    ],
  },
  "/archive": {
    title: "Архив",
    items: [
      {
        label: "Архивлагдсан тайлан хайх",
        steps: [
          "Хайлтын талбарт Тайлангийн дугаар бичнэ",
          "Огноо, лабораторийн төрлөөр шүүнэ",
        ],
      },
      {
        label: "PDF татах",
        steps: ["Тайлангийн мөрөн дээр дарна", "PDF товч дарж татаж авна"],
      },
    ],
  },
  "/approve": {
    title: "Баталгаажуулах",
    items: [
      {
        label: "Хүсэлт батлах",
        steps: [
          "Батлах тайланг жагсаалтаас сонгоно",
          "Шинжилгээний үр дүнг шалгана",
          "'Батлах' товч дарна",
          "Нууц үгээ оруулж батлана",
        ],
      },
      {
        label: "Хүсэлт буцаах",
        steps: [
          "Буцаах Тайланыг сонгоно",
          "'Буцаах' товч дарна",
          "Шалтгаанаа бичнэ",
        ],
      },
    ],
  },
  "/employees": {
    title: "Хүмүүс",
    items: [
      {
        label: "Ажилчдын жагсаалт харах",
        description: "Бүх ажилчдын нэр, имэйл, эрхийн түвшинг жагсаалтаас харах боломжтой.",
      },
      {
        label: "Шинэ ажилтан нэмэх",
        roles: ELEVATED_ROLES,
        steps: [
          "'+ Инженер нэмэх' товч дарна",
          "Нэр, имэйл, нууц үг оруулна",
          "Эрхийн түвшин сонгоно",
          "'Үүсгэх' товч дарна",
        ],
      },
      {
        label: "Ажилтны мэдээлэл засах",
        roles: ELEVATED_ROLES,
        steps: [
          "Ажилтны мөрөн дээр дарна",
          "Имэйл, эрх, нууц үг зэргийг өөрчилнө",
          "Хадгалах товч дарна",
        ],
      },
      {
        label: "Гарын үсэг тохируулах",
        roles: ELEVATED_ROLES,
        steps: [
          "Ажилтны мэдээлэл засах цонхыг нээнэ",
          "Гарын үсэг хэсэгт 'Зураг оруулах' товч дарна",
          "Цаасан дээрх гарын үсгийн зургийг сонгоно",
          "Цагаан дэвсгэр автоматаар арилна",
        ],
      },
    ],
  },
  "/lab-spec": {
    title: "Лаб төрөл",
    items: [
      {
        label: "Шинжилгээний төрөл нэмэх",
        steps: ["'Шинэ төрөл' товч дарна", "Төрлийн нэр оруулна", "Хадгална"],
      },
      {
        label: "Үзүүлэлт тохируулах",
        steps: [
          "Төрөл дээр дарж дэлгэрэнгүй хэсгийг нээнэ",
          "Үзүүлэлт нэмэх, засах, устгах боломжтой",
          "Норм утга, нэгж зэргийг тохируулна",
        ],
      },
    ],
  },
  "/locations": {
    title: "Байршил",
    items: [
      {
        label: "Байршил нэмэх",
        steps: [
          "'Шинэ байршил' товч дарна",
          "Байршлын нэр оруулна",
          "Хадгална",
        ],
      },
      {
        label: "Байршил засах",
        steps: ["Байршлын мөрөн дээр дарна", "Нэрийг өөрчилнө", "Хадгална"],
      },
    ],
  },
  "/reports": {
    title: "Тайлан",
    items: [
      {
        label: "Шинжилгээний үр дүн оруулах",
        steps: [
          "Тайлангийн дэлгэрэнгүй хуудас руу орно",
          "Үзүүлэлт бүрийн утгыг оруулна",
          "Хадгалах товч дарна",
        ],
      },
      {
        label: "Гарын үсэг зурах",
        steps: [
          "Бүх үр дүнг оруулсны дараа 'Гарын үсэг зурах' товч дарна",
          "Хянах инженерийг сонгоно",
          "Нууц үгээ оруулна",
          "Баталгаажуулна",
        ],
      },
      {
        label: "PDF үүсгэх",
        description:
          "Тайлан баталгаажсаны дараа PDF товч идэвхжинэ. Дарахад Тайлангийн PDF файл автоматаар үүсэж татагдана.",
      },
    ],
  },
};

const FALLBACK_HELP: HelpSection = {
  title: "Тусламж",
  items: [
    { label: "Сорьц — Тайлан удирдах", link: "/" },
    { label: "Архив — Хуучин Тайлан харах", link: "/archive" },
    { label: "Баталгаажуулах — Хүсэлт шалгах", link: "/approve", roles: ELEVATED_ROLES },
    { label: "Хүмүүс — Ажилтан харах", link: "/employees" },
    { label: "Лаб төрөл — Шинжилгээ тохируулах", link: "/lab-spec", roles: ELEVATED_ROLES },
    { label: "Байршил — Байршил удирдах", link: "/locations", roles: ELEVATED_ROLES },
  ],
};

function getHelpForPath(pathname: string, role: string): HelpSection {
  const section = HELP_CONTENT[pathname]
    ?? (pathname.startsWith("/reports") ? HELP_CONTENT["/reports"] : null)
    ?? FALLBACK_HELP;

  return {
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  };
}

function useHelpVisibility() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const enabled = localStorage.getItem("helpEnabled");
      // If explicitly disabled by user
      if (enabled === "false") {
        setVisible(false);
        return;
      }
      // If explicitly enabled by user
      if (enabled === "true") {
        setVisible(true);
        return;
      }
      // Auto: check 5-day window
      const firstSeen = localStorage.getItem("helpFirstSeen");
      if (!firstSeen) {
        localStorage.setItem("helpFirstSeen", String(Date.now()));
        setVisible(true);
        return;
      }
      const elapsed = Date.now() - Number(firstSeen);
      setVisible(elapsed < FIVE_DAYS_MS);
    };

    check();

    // Listen for storage changes from sidebar toggle
    const onStorage = (e: StorageEvent) => {
      if (e.key === "helpEnabled") check();
    };
    window.addEventListener("storage", onStorage);

    // Custom event for same-tab updates
    const onCustom = () => check();
    window.addEventListener("helpToggled", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("helpToggled", onCustom);
    };
  }, []);

  return visible;
}

export default function FloatingHelp() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const visible = useHelpVisibility();
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Reset expanded item when path changes
  useEffect(() => {
    setExpandedIdx(null);
  }, [pathname]);

  if (!visible) return null;

  const help = getHelpForPath(pathname, user?.role ?? "");

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-cyan-900 text-white shadow-lg hover:bg-cyan-800 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Тусламж"
      >
        {open ? <X className="h-5 w-5" /> : <CircleHelp className="h-5 w-5" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 right-6 z-50 w-[350px] max-h-[70vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {help.title}
                </h3>
                <p className="text-[11px] text-slate-500">Хэрхэн ашиглах вэ?</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {help.items.map((item, idx) => {
                const isExpanded = expandedIdx === idx;
                const hasContent = item.steps || item.description;

                return (
                  <div key={idx}>
                    <button
                      onClick={() => {
                        if (item.link) {
                          router.push(item.link);
                          setOpen(false);
                          return;
                        }
                        if (hasContent) {
                          setExpandedIdx(isExpanded ? null : idx);
                        }
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        } ${item.link ? "text-cyan-600" : ""}`}
                      />
                      <span className={item.link ? "text-cyan-700" : ""}>
                        <div className="text-[15px] font-semibold">{item.label}</div>
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && hasContent && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mr-3 mb-2 pl-3 border-l-2 border-cyan-100">
                            {item.description && (
                              <p className="text-xs text-slate-500 leading-relaxed py-1.5">
                                {item.description}
                              </p>
                            )}
                            {item.steps && (
                              <ol className="space-y-1 py-1.5">
                                {item.steps.map((step, stepIdx) => (
                                  <li
                                    key={stepIdx}
                                    className="text-xs text-slate-600 flex gap-2"
                                  >
                                    <span className="text-cyan-600 font-medium shrink-0">
                                      {stepIdx + 1}.
                                    </span>
                                    <div className="text-[13px]">{step}</div>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
