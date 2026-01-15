
import { DeleteDialogProps } from "@/app/types/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
export function DeleteDialog({deleteDialogOpener, reportId, setDeleteDialogOpener}:DeleteDialogProps){
    const onDeleteClick = async()=>{
    console.log("delete daragdsan shvv")
     try{
       if(!reportId) return console.log('report id not found')
      console.log(`delete daragdsan shvv reportId:${reportId}`)
 
       const response = await fetch(`http://localhost:8000/reports/delete/${reportId}`,{
         method: "PUT"
       })

     }catch(error){
       console.log('failed to delete')
     }
     
   }
    return(
     <AlertDialog open={deleteDialogOpener} onOpenChange={setDeleteDialogOpener}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onDeleteClick}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    )
}