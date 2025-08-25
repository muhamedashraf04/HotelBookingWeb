import { toast } from "sonner";

function ErrorToast(message: string) {
  toast.dismiss();
  toast.error(`${message}`, { duration: 2000 });
}
export default ErrorToast;
