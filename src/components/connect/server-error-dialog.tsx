import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ServerErrorDialogProps {
  message: string | null;
  onAcknowledge: () => void;
}

/**
 * Reusable modal for the protocol's Error message: shown with the server's
 * text and a single "Ok" button. Per the requirements, acknowledging it
 * returns the user to the connect page.
 */
export function ServerErrorDialog({ message, onAcknowledge }: ServerErrorDialogProps) {
  return (
    <AlertDialog open={message !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Server error</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onAcknowledge}>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
