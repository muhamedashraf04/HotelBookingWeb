import { toast } from "sonner";

function SuccessToast(message: string) {
  toast.dismiss();
  toast.success(`${message}`, { duration: 2000 });
}
export default SuccessToast;
