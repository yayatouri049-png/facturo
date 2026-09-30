import "@/App.css";
import InvoiceApp from "@/InvoiceApp";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <InvoiceApp />
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

export default App;
