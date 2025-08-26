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
import axios from "axios";
import { Url } from "../GlobalVariables";
import ErrorToast from "./Toasts/ErrorToast";
import LoadingToast from "./Toasts/LoadingToast";
import SuccessToast from "./Toasts/SuccessToast";
type data = {
  id: string;
  message: string;
  Area: string;
  Controller: string;
  Action: string;

  onDeleted?: () => void;
};

function DeletePopup(Data: data) {
  const { id, message, Area, Controller, Action, onDeleted } = Data;
  const request = `${Url}/${Area}/${Controller}/${Action}?id=${id}`;
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
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={async () => {
              LoadingToast(`Deleting ${Controller}`);
              try {
                const response = await axios.delete(request);

                if (response.status != 200) throw new Error("Failed to delete");
                onDeleted?.();
                {
                  SuccessToast(`${Data.Controller} deleted successfully`);
                }
              } catch (err: any) {
                ErrorToast(err.message || "Error deleting");
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

export default DeletePopup;
