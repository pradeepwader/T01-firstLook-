import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../services/api';
import { errMsg } from '../utils/format';

/** Local-testing stand-in for the Cashfree checkout (only works when server PAYMENT_MODE=mock). */
export default function PaymentMock() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const navigate = useNavigate();

  const finish = async (success) => {
    try {
      await orderAPI.mockPay(orderId, success);
      navigate(`/payment/status?order_id=${orderId}`, { replace: true });
    } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="container-t01 py-16 flex justify-center">
      <div className="card p-8 max-w-md w-full text-center">
        <span className="badge bg-amber/30 text-navy-800">TEST MODE</span>
        <h1 className="text-2xl font-extrabold mt-4">Mock payment gateway</h1>
        <p className="text-navy-800/70 mt-2">No real money is used. Choose the outcome to simulate.</p>
        <p className="text-xs break-all mt-3 text-navy-800/50">{orderId}</p>
        <div className="flex flex-col gap-3 mt-6">
          <button className="btn-primary" onClick={() => finish(true)}>Simulate successful payment</button>
          <button className="btn-outline-dark" onClick={() => finish(false)}>Simulate failed payment</button>
        </div>
      </div>
    </div>
  );
}
