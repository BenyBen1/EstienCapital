import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, DollarSign, User, Hash } from 'lucide-react';

interface DepositRequest {
  id: string;
  amount: number;
  reference_number?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface DepositModalProps {
  open: boolean;
  request: DepositRequest | null;
  action: 'approve' | 'reject';
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

export default function DepositModal({
  open,
  request,
  action,
  onClose,
  onApprove,
  onReject,
}: DepositModalProps) {
  if (!request) return null;

  const isApprove = action === 'approve';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isApprove ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            )}
            <DialogTitle className="text-xl">
              {isApprove ? 'Confirm Deposit' : 'Mark as Not Received'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600">
            {isApprove 
              ? 'Are you sure you want to confirm this deposit has been received?' 
              : 'Mark this deposit as not yet received?'
            }
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Customer</span>
                <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                {request.profiles?.email && (
                  <p className="text-sm text-gray-600">{request.profiles.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Amount</span>
                <p className="font-bold text-lg">{formatCurrency(request.amount)}</p>
              </div>
            </div>

            {request.reference_number && (
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Reference</span>
                  <p className="font-mono text-sm">{request.reference_number}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            onClick={() => isApprove ? onApprove(request.id) : onReject(request.id)}
            className={`flex-1 ${isApprove ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isApprove ? 'Confirm Deposit' : 'Not Yet Received'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}