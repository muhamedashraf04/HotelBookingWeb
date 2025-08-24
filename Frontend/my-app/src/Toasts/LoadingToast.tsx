import { toast } from "sonner";

function LoadingToast(message: string) {
  toast.loading(`${message}`);
}
export default LoadingToast;
