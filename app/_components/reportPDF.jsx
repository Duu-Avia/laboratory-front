// "use client";

// export default function ReportPDF({ sample, results }) {
//   return (
//     <div id="pdf-content" style={{ 
//       padding: '20px', 
//       fontFamily: 'Arial, sans-serif',
//       backgroundColor: 'white',
//       color: 'black',
//       width: '210mm',
//       minHeight: '297mm'
//     }}>
//       {/* Header */}
//       <div style={{ display: 'flex', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
//         <div style={{ 
//           backgroundColor: '#1e40af', 
//           color: 'white', 
//           padding: '10px 15px', 
//           marginRight: '20px',
//           fontWeight: 'bold'
//         }}>
//           ЭНЕРЖИ<br/>РЕСУРС ХХК
//         </div>
//         <div style={{ textAlign: 'center', flex: 1 }}>
//           <h2 style={{ margin: 0, fontSize: '16px' }}>УСНЫ ШИНЖИЛГЭЭНИЙ ЛАБОРАТОРИsssss</h2>
//           <p style={{ margin: '5px 0', fontSize: '12px' }}>Өмнөговь аймаг, Цогтцэций сум, "Ухаа Худаг" уурхай</p>
//           <p style={{ margin: 0, fontSize: '12px', color: 'blue' }}>И-мэйл хаяг: laboratory@mmc.mn</p>
//         </div>
//       </div>

//       {/* Title */}
//       <h1 style={{ textAlign: 'center', fontSize: '22px', margin: '30px 0' }}>СОРИЛТЫН ТАЙЛАН</h1>
//       <p style={{ textAlign: 'center', fontSize: '14px' }}>№: {sample?.report_number || '2024_001'}</p>

//       {/* Right side info */}
//       <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '12px' }}>
//         <p style={{ margin: '2px 0' }}>Хэвлэсэн огноо: {new Date().toLocaleDateString('mn-MN')}</p>
//         <p style={{ margin: '2px 0' }}>Хуудасны дугаар: 1/1</p>
//       </div>

//       {/* Info Table */}
//       <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#e5e7eb' }}>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Лабораторийн дугаар</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Техникийн шаардлага</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Сорьцын тодорхойлолт</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Сорьц авсан аргачлал</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sample?.lab_number || '124/645-647'}</td>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sample?.standard || 'MNS 0900:2018'}</td>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sample?.type_name || 'Унд, ахуйн ус'}</td>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>MNS ISO 5667-5:2001</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Sample Names */}
//       <div style={{ marginBottom: '20px', fontSize: '12px' }}>
//         <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Сорьцын нэр:</p>
//         <p style={{ margin: '2px 0 2px 20px' }}>1. {sample?.sample_code} {sample?.sample_name}</p>
//         <p style={{ marginTop: '10px' }}><strong>Сорьц авсан:</strong> {sample?.sampled_by || 'Ус хангамжийн техникч'}</p>
//       </div>

//       {/* Sample Info Table */}
//       <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#e5e7eb' }}>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Сорьцын хэмжээ</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Сорьц авсан огноо</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Шинжилсэн огноо</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Тус бүр {sample?.sample_amount || '0.5л'}</td>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sample?.sample_date || '-'}</td>
//             <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sample?.test_date || '-'}</td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Results Table */}
//       <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '12px' }}>Шинжилгээний үр дүн:</p>
//       <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#e5e7eb' }}>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>№</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Үзүүлэлт</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Аргын стандарт</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Зөвшөөрөгдөх хэмжээ</th>
//             <th style={{ border: '1px solid #000', padding: '8px' }}>Дүн</th>
//           </tr>
//         </thead>
//         <tbody>
//           {/* {results?.map((row, index) => (
//             <tr key={index}>
//               <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
//               <td style={{ border: '1px solid #000', padding: '6px' }}>{row.indicator_name}</td>
//               <td style={{ border: '1px solid #000', padding: '6px' }}>{row.test_method}</td>
//               <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{row.limit_value}</td>
//               <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{row.result_value || 'Илрээгүй'}</td>
//             </tr>
//           ))} */}
//         </tbody>
//       </table>

//       <p style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '20px' }}>*Итгэмжлэлд хамрагдаагүй.</p>
//       <p style={{ textAlign: 'right', fontStyle: 'italic', marginBottom: '30px', fontSize: '11px' }}>
//         Энэхүү сорилтын дүн нь тухайн сорьцын хувьд хүчинтэй.
//       </p>

//       {/* Signatures */}
//       <div style={{ marginTop: '40px', fontSize: '12px' }}>
//         <p><strong>Шинжилгээ гүйцэтгэсэн:</strong> Микробиологич <span style={{ marginLeft: '50px' }}>/{results?.[0]?.analyst_name || 'Б. Түвшинжаргал'}/</span></p>
//         <p><strong>Хянаж баталгаажуулсан:</strong> Ахлах химич <span style={{ marginLeft: '50px' }}>/Б. Алдарбаяр/</span></p>
//       </div>

//       <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '40px', fontStyle: 'italic' }}>
//         Сорилтын лабораторийн зөвшөөрөлгүй хуулбарлахыг хориглоно.
//       </p>
//     </div>
//   );
// }