import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from './page'; // or copy the function if not exported

export default function DepositModal({
  open,
  request,
  action,
  onClose,
  onApprove,
  onReject,
}: {
  open: boolean;
  request: any;
  action: 'approve' | 'reject';
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve'
              ? `Confirm Deposit Request`
              : `Not Yet Received Deposit`}
          </DialogTitle>
        </DialogHeader>
        <div>
          Are you sure you want to {action === 'approve' ? 'confirm' : 'mark as not yet received'} this deposit request?
          <div className="mt-2 text-sm text-gray-500">
            <div><b>Customer:</b> {request?.profiles?.full_name}</div>
            <div><b>Amount:</b> {request && formatCurrency(request.amount)}</div>
            <div><b>Reference:</b> {request?.reference_number}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === 'approve' ? 'default' : 'destructive'}
            onClick={() => action === 'approve' ? onApprove(request.id) : onReject(request.id)}
          >
            {action === 'approve' ? 'Confirm' : 'Not Yet Received'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
