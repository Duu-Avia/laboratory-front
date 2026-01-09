// "use client";

// interface Sample {
//   code: string;
//   name: string;
// }

// interface Indicator {
//   id: number;
//   name: string;
//   method: string;
//   limit: string;
//   note?: string;
// }

// interface Result {
//   sample_code: string;
//   indicator_id: number;
//   result_value: string;
// }

// interface ReportData {
//   report_number?: string;
//   print_date?: string;
//   lab_number?: string;
//   standard?: string;
//   sample_type?: string;
//   sample_method?: string;
//   sample_amount?: string;
//   sample_date?: string;
//   test_start_date?: string;
//   test_end_date?: string;
//   sampled_by?: string;
//   analyst_name?: string;
//   approver_name?: string;
//   indicators?: Indicator[];
// }

// interface ReportTemplateProps {
//   data?: ReportData;
//   samples?: Sample[];
//   results?: Result[];
// }

// export default function ReportTemplate({ data, samples, results }: ReportTemplateProps) {
//   const reportData = {
//     report_number: data?.report_number || "2024_001",
//     print_date: data?.print_date || new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
//     lab_number: data?.lab_number || "___/___-___",
//     standard: data?.standard || "MNS 0900:2018",
//     sample_type: data?.sample_type || "Унд, ахуйн ус",
//     sample_method: data?.sample_method || "MNS ISO 5667-5:2001",
//     sample_amount: data?.sample_amount || "Тус бүр 0.5л",
//     sample_date: data?.sample_date || "____.__.__",
//     test_start_date: data?.test_start_date || "____.__.__",
//     test_end_date: data?.test_end_date || "____.__.__",
//     sampled_by: data?.sampled_by || "_________________",
//     analyst_name: data?.analyst_name || "Б. Түвшинжаргал",
//     approver_name: data?.approver_name || "Б. Алдарбаяр",
//   };

//   const defaultIndicators: Indicator[] = [
//     { id: 1, name: "Бичил биетний ерөнхий тоо", method: "MNS ISO 6222-1998", limit: "1мл-т 100", note: "" },
//     { id: 2, name: "E.coli", method: "MNS ISO 9308-1:1998", limit: "100мл-т илрэхгүй", note: "" },
//     { id: 3, name: "ГБЭТ нян", method: "MNS ISO 19250:2017", limit: "25мл-т илрэхгүй", note: "*" },
//   ];

//   const indicators = data?.indicators || defaultIndicators;

//   const sampleList = samples || [
//     { code: "___", name: "________________________________" },
//     { code: "___", name: "________________________________" },
//     { code: "___", name: "________________________________" },
//   ];

//   const getResultValue = (sampleCode: string, indicatorId: number): string => {
//     if (!results || results.length === 0) return "";
//     const result = results.find(
//       r => r.sample_code === sampleCode && r.indicator_id === indicatorId
//     );
//     return result?.result_value || "";
//   };
//   console.log(data, samples, results, 'haanaas irj baigaan ul medegdeh data');
//   return (
//     <div id="pdf-content" className="bg-white text-black p-10 w-[210mm] min-h-[297mm] font-sans text-xs">
      
//       {/* HEADER */}
//       <div className="flex items-start mb-5">
//         <div className="bg-blue-800 text-white px-4 py-3 mr-5 font-bold text-sm leading-tight">
//           ЭНЕРЖИ<br/>РЕСУРС ХХК
//         </div>
//         <div className="flex-1 text-center">
//           <h2 className="text-base font-bold mb-1">УСНЫ ШИНЖИЛГЭЭНИЙ ЛАБОРАТОРИsssSSSSS</h2>
//           <p className="text-[11px] m-0">Өмнөговь аймаг, Цогтцэций сум, "Ухаа Худаг" уурхай</p>
//           <p className="text-[11px] m-0">
//             И-мэйл хаяг: <span className="text-blue-600">laboratory@mmc.mn</span>
//           </p>
//         </div>
//       </div>

//       {/* TITLE */}
//       <h1 className="text-center text-xl font-bold mt-8 mb-2">СОРИЛТЫН ТАЙЛАН</h1>
//       <p className="text-center text-sm mb-2">
//         №: <span className="text-red-600">{reportData.report_number}</span>
//       </p>

//       {/* Right info */}
//       <div className="text-right text-[11px] mb-5">
//         <p>Хэвлэсэн огноо: {reportData.print_date}</p>
//         <p>Хуудасны дугаар: 1/1</p>
//       </div>

//       {/* INFO TABLE */}
//       <table className="w-full border-collapse mb-4 text-[11px]">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border border-black p-2 font-bold">Лабораторийн дугаар</th>
//             <th className="border border-black p-2 font-bold">Техникийн шаардлага</th>
//             <th className="border border-black p-2 font-bold">Сорьцын тодорхойлолт</th>
//             <th className="border border-black p-2 font-bold">Сорьц авсан аргачлал</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td className="border border-black p-2 text-center text-red-600">{reportData.lab_number}</td>
//             <td className="border border-black p-2 text-center">{reportData.standard}</td>
//             <td className="border border-black p-2 text-center">{reportData.sample_type}</td>
//             <td className="border border-black p-2 text-center">{reportData.sample_method}</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* SAMPLE NAMES */}
//       <div className="mb-4 text-[11px]">
//         <p className="font-bold mb-1">Сорьцын нэр:</p>
//         {sampleList.map((sample, index) => (
//           <p key={index} className={`ml-5 ${sample.name.includes('_') ? 'text-gray-400' : 'text-red-600'}`}>
//             {index + 1}. {sample.code} {sample.name}
//           </p>
//         ))}
//         <p className="mt-3">
//           <span className="font-bold">Сорьц авсан:</span>{' '}
//           <span className={reportData.sampled_by.includes('_') ? 'text-gray-400' : 'text-red-600'}>
//             {reportData.sampled_by}
//           </span>
//         </p>
//       </div>

//       {/* SAMPLE INFO TABLE */}
//       <table className="w-full border-collapse mb-5 text-[11px]">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border border-black p-2 font-bold">Сорьцын хэмжээ</th>
//             <th className="border border-black p-2 font-bold">Сорьц авсан огноо</th>
//             <th className="border border-black p-2 font-bold">Шинжилсэн огноо</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td className="border border-black p-2 text-center text-red-600">{reportData.sample_amount}</td>
//             <td className="border border-black p-2 text-center text-red-600">{reportData.sample_date}</td>
//             <td className="border border-black p-2 text-center text-red-600">
//               {reportData.test_start_date} - {reportData.test_end_date}
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       {/* RESULTS TABLE */}
//       <p className="font-bold mb-2 text-[11px]">Шинжилгээний үр дүн:</p>
//       <table className="w-full border-collapse mb-2 text-[10px]">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="border border-black p-2 font-bold" rowSpan={2}>№</th>
//             <th className="border border-black p-2 font-bold" colSpan={2}>Шинжилгээний</th>
//             <th className="border border-black p-2 font-bold" rowSpan={2}>Зөвшөөрөгдөх хэмжээ</th>
//             <th className="border border-black p-2 font-bold" colSpan={sampleList.length}>Сорьцын дугаар</th>
//           </tr>
//           <tr className="bg-gray-100">
//             <th className="border border-black p-2 font-bold">Үзүүлэлт</th>
//             <th className="border border-black p-2 font-bold">Аргын стандарт</th>
//             {sampleList.map((sample, index) => (
//               <th key={index} className="border border-black p-2 font-bold text-red-600">
//                 {sample.code}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {indicators.map((indicator, index) => (
//             <tr key={indicator.id}>
//               <td className="border border-black p-2 text-center">{index + 1}.</td>
//               <td className="border border-black p-2">
//                 {indicator.name}{indicator.note && <span>*</span>}
//               </td>
//               <td className="border border-black p-2">{indicator.method}</td>
//               <td className="border border-black p-2 text-center">{indicator.limit}</td>
//               {sampleList.map((sample, sIndex) => (
//                 <td key={sIndex} className="border border-black p-2 text-center font-semibold">
//                   {getResultValue(sample.code, indicator.id) || (
//                     <span className="text-gray-300">____</span>
//                   )}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <p className="text-[10px] italic mb-5">*Итгэмжлэлд хамрагдаагүй.</p>
//       <p className="text-right italic text-[11px] mb-8">
//         Энэхүү сорилтын дүн нь тухайн сорьцын хувьд хүчинтэй.
//       </p>

//       {/* SIGNATURES */}
//       <div className="mt-10 text-[11px]">
//         <p className="mb-3">
//           <span className="font-bold">Шинжилгээ гүйцэтгэсэн:</span> Микробиологич 
//           <span className="ml-12">/{reportData.analyst_name}/</span>
//         </p>
//         <p>
//           <span className="font-bold">Хянаж баталгаажуулсан:</span> Ахлах химич 
//           <span className="ml-12">/{reportData.approver_name}/</span>
//         </p>
//       </div>

//       {/* FOOTER */}
//       <p className="text-center text-[10px] italic mt-10">
//         Сорилтын лабораторийн зөвшөөрөлгүй хуулбарлахыг хориглоно.
//       </p>
//     </div>
//   );
// }