// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { SampleFormSection } from "./SampleFormSection"

// export function EditReport() {
//   return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-5xl">
//         <DialogHeader>
//           <DialogTitle>Шинэ хүсэлт</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label>Тайлан</Label>
//             <Input
//               value={reportTitle}
//               onChange={(e) => onReportTitleChange(e.target.value)}
//               placeholder="Нэгдсэн төв ус гэх мэт..."
//             />
//           </div>

//           <SampleFormSection
//             sampleGroup={sampleGroup}
//             sampleTypes={sampleTypes}
//             onAddSampleName={onAddSampleName}
//             onRemoveSampleName={onRemoveSampleName}
//             onUpdateSampleName={onUpdateSampleName}
//             onTypeChange={onTypeChange}
//             onFieldChange={onFieldChange}
//             onToggleIndicator={onToggleIndicator}
//           />
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="secondary" onClick={() => onOpenChange(false)}>
//             Болих
//           </Button>
//           <Button onClick={onSave}>Хадгалах</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
