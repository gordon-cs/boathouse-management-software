import BoatCatalog from "@features/boats/components/BoatCatalog";
import UserCatalog from "@features/users/components/UserCatalog";
import CheckoutCatalog from "@features/checkouts/components/CheckoutCatalog";

function App() {
  return (
    <div>
      <UserCatalog />

      <BoatCatalog />

      <CheckoutCatalog />
    </div>
  );
}

export default App;
