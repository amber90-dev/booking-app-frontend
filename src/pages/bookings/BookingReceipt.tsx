import React from "react";

type Booking = {
  id?: string;
  bookingRef?: string | null;
  accountNo?: string | null;
  costCentre?: string | null;
  companyName?: string | null;
  companyTelNo?: string | null;
  vip?: boolean;
  contactId?: string | null;
  contactForename?: string | null;
  contactSurname?: string | null;
  contactTelNo?: string | null;
  staffId?: string | null;
  staffForename?: string | null;
  staffSurname?: string | null;
  staffTelNo?: string | null;
  dateTaken?: string | null;
  timeTaken?: string | null;
  clientId?: string | null;
  clientForename?: string | null;
  clientSurname?: string | null;
  clientAddress1?: string | null;
  clientAddress2?: string | null;
  clientTown?: string | null;
  clientPostcode?: string | null;
  clientTelNo?: string | null;
  clientMobile?: string | null;
  driverNo?: string | null;
  driverForename?: string | null;
  driverSurname?: string | null;
  driverMobile?: string | null;
  date?: string | null;
  time?: string | null;
  pickUpAddress?: string | null;
  dropOffAddress?: string | null;
  via?: string | null;
  extraInfo?: string | null;
  detailsGiven?: boolean;
  vehicle?: string | null;
  cancelled?: boolean;
  clientScheduledFare?: string | null;
  clientCharge?: string | null;
  clientMeetGreet?: string | null;
  clientWaitingTime?: string | null;
  clientWaitingTimePrice?: string | null;
  clientLhrGtwCharge?: string | null;
  clientViaPrice?: string | null;
  clientGratuity?: string | null;
  clientCarPark?: string | null;
  totalClient?: string | null;
  driverScheduledFare?: string | null;
  driverCharge?: string | null;
  driverMeetGreet?: string | null;
  driverWaitingTime?: string | null;
  driverWaitingTimePrice?: string | null;
  driverLhrGtwCharge?: string | null;
  driverViaPrice?: string | null;
  driverGratuity?: string | null;
  driverCarPark?: string | null;
  totalDriver?: string | null;
  notes?: string | null;
};

interface Props {
  booking: Booking;
}

const BookingReceipt: React.FC<Props> = ({ booking }) => {
  const getDayName = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="booking-receipt-print bg-white text-slate-900 font-sans text-[11px] leading-tight">
      {/* Professional Header - Compact */}
      <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2 mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">RoadServe</h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Chauffeur & Professional Services</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight leading-none mb-0.5">Booking Voucher</h2>
          <p className="font-mono text-slate-500 text-[10px] uppercase">REF: <span className="font-bold text-slate-900">{booking.bookingRef || "N/A"}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        
        {/* Column 1: CLIENT & ACCOUNT & DRIVER */}
        <div className="space-y-5">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 border-b border-slate-100 pb-0.5">Client & Account</h3>
            <div className="space-y-1.5">
              <div>
                <p className="text-sm font-bold text-slate-900">{booking.clientForename} {booking.clientSurname}</p>
                <div className="text-slate-600 leading-[1.2]">
                  <p>{booking.clientAddress1}</p>
                  {booking.clientAddress2 && <p>{booking.clientAddress2}</p>}
                  <p>{booking.clientTown} {booking.clientPostcode}</p>
                </div>
                <p className="pt-0.5 font-bold text-slate-800">{booking.clientTelNo || booking.clientMobile || "—"}</p>
              </div>
              
              <div className="pt-1 grid grid-cols-2 gap-2">
                <div>
                  <Label>Account No</Label>
                  <Value className="font-mono font-bold text-slate-900">{booking.accountNo || "—"}</Value>
                </div>
                <div>
                  <Label>Cost Centre</Label>
                  <Value>{booking.costCentre || "—"}</Value>
                </div>
              </div>
              <div>
                <Label>Company</Label>
                <Value className="font-bold text-slate-900">{booking.companyName || "Private Hire"}</Value>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 border-b border-slate-100 pb-0.5">Driver & Vehicle</h3>
            <div className="space-y-2">
              <div>
                <Label>Driver In Charge</Label>
                <Value className="text-sm font-bold text-slate-900 leading-tight">
                  {booking.driverForename} {booking.driverSurname || ""}
                </Value>
                <p className="font-mono font-bold text-slate-600 tracking-tight">{booking.driverMobile || "—"}</p>
              </div>
              <div>
                <Label>Vehicle Assigned</Label>
                <Value className="font-bold uppercase text-slate-800 tracking-tighter">
                  {booking.vehicle || "EXECUTIVE BUSINESS CLASS"}
                </Value>
              </div>
            </div>
          </section>
        </div>

        {/* Column 2: JOURNEY & BILLING */}
        <div className="space-y-5">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 border-b border-slate-100 pb-0.5">Journey Overview</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label>Date</Label>
                <Value className="font-bold text-slate-900">{booking.date || "—"}</Value>
                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-0.5">{getDayName(booking.date)}</p>
              </div>
              <div className="text-right">
                <Label>Time</Label>
                <Value className="font-black text-slate-900 text-xl leading-none">{booking.time || "—"}</Value>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative pl-5 before:absolute before:left-1 before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-200 after:absolute after:left-[1px] after:top-[5px] after:w-[5px] after:h-[5px] after:bg-slate-900 after:rounded-full">
                <Label className="mb-0 text-[9px]">Pick Up</Label>
                <Value className="italic font-bold text-slate-800 leading-tight">{booking.pickUpAddress || "—"}</Value>
              </div>
              {booking.via && (
                <div className="relative pl-5 before:absolute before:left-1 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 after:absolute after:left-[1px] after:top-[8px] after:w-[5px] after:h-[5px] after:bg-blue-600 after:rounded-full">
                  <Label className="mb-0 text-[9px]">Via</Label>
                  <Value className="italic font-medium text-blue-700">{booking.via}</Value>
                </div>
              )}
              <div className="relative pl-5 after:absolute after:left-[1px] after:top-[5px] after:w-[5px] after:h-[5px] after:bg-rose-600 after:rounded-full">
                <Label className="mb-0 text-[9px]">Drop Off</Label>
                <Value className="italic font-bold text-slate-800 leading-tight">{booking.dropOffAddress || "—"}</Value>
              </div>
            </div>
          </section>

          {booking.extraInfo && (
            <section className="bg-amber-50/40 p-2 rounded border border-amber-100/50">
              <Label className="text-amber-800 text-[8px] mb-0.5 leading-none">Special Instructions</Label>
              <p className="text-[10px] text-slate-600 italic leading-tight whitespace-pre-wrap">
                {booking.extraInfo}
              </p>
            </section>
          )}

          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 border-b border-slate-100 pb-0.5">Billing Summary</h3>
            <div className="bg-slate-50/50 rounded-lg p-3 space-y-1.5 border border-slate-100">
              <PriceRow label="Scheduled Fare" value={booking.clientScheduledFare} />
              {parseFloat(booking.clientViaPrice || "0") > 0 && <PriceRow label="Via Point Charges" value={booking.clientViaPrice} />}
              {parseFloat(booking.clientMeetGreet || "0") > 0 && <PriceRow label="Meet & Greet" value={booking.clientMeetGreet} />}
              {parseFloat(booking.clientGratuity || "0") > 0 && <PriceRow label="Gratuity" value={booking.clientGratuity} />}
              {parseFloat(booking.clientLhrGtwCharge || "0") > 0 && <PriceRow label="Drop off charge" value={booking.clientLhrGtwCharge} />}
              
              <div className="border-t-2 border-slate-900 mt-2 pt-2 flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Grand Total Due</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">£{booking.totalClient || "0.00"}</span>
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-8 pt-2 border-t border-slate-100 flex justify-between items-end opacity-40 grayscale italic">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">RoadServe Official Voucher</p>
          <p className="text-[7px] mt-0.5">Thank you for traveling with us. Professional Excellence Guaranteed.</p>
        </div>
        <div className="text-right text-[9px] font-bold uppercase tracking-tight text-slate-400">
          <p>www.roadserveuk.co.uk</p>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 ${className}`}>{children}</p>
);

const Value = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-slate-800 font-medium ${className}`}>{children}</p>
);

const PriceRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex justify-between items-center text-slate-600">
    <span className="text-[10px] font-medium tracking-tight uppercase opacity-80 current-font">{label}</span>
    <span className="font-mono font-bold text-slate-800 text-xs">£{parseFloat(value || "0").toFixed(2)}</span>
  </div>
);

export default BookingReceipt;
