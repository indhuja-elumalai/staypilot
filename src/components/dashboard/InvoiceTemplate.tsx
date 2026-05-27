export const InvoiceTemplate = ({ booking, property }: { booking: any, property: any }) => (
    <div id="invoice-print" className="hidden print:block p-8 bg-white text-black">
        <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <p>{property.address}</p>
            <p>Contact: {property.phone}</p>
        </div>
        {/* ...rest of your content... */}
        <div className="footer">
            <p>{property.termsAndConditions}</p>
        </div>
    </div>
);