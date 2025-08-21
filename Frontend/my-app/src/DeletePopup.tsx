"use client";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
const Url = "http://localhost:5002";
type Data = {
  id: number;
  message: string;
  Area: string;
  Controller: string;
  Action: string;

  onDeleted?: () => void;
};
function Popup(Data: Data) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>{Data.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={async () => {
              try {
                const response = await fetch(
                  `${Url}/${Data.Area}/${Data.Controller}/${Data.Action}?id=${Data.id}`,
                  { method: "DELETE" }
                );
                if (!response.ok) throw new Error("Failed to delete");
                Data.onDeleted?.();
                toast.success(
                  `${Data.Controller} #${Data.id} deleted successfully`
                );
              } catch (err: any) {
                toast.error(err.message || "Error deleting");
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Popup;
