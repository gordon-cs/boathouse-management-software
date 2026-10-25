// import { useEffect, useState } from "react";

// import { supabase } from "@lib/supabaseClient";
// import type { Tables } from "@db-types/supabase";

function Boats() {
  // type User = Tables<"user">;
  // type Boat = Tables<"boat">;
  // type Checkout = Tables<"check_out">;

  // const [users, setUsers] = useState<User[]>([]);
  // const [boats, setBoats] = useState<Boat[]>([]);
  // const [checkouts, setCheckouts] = useState<Checkout[]>([]);

  return (
    <body>
      <header>
        <div className="site-title">Record Browser</div>

        <nav>
          <a href="#" className="active">
            Boats
          </a>
          <a href="users.html">Users</a>
          <a href="repairs.html">Repairs</a>
        </nav>

        <nav>
          <a href="SignIn.html">Sign Out</a>
        </nav>
      </header>

      <main className="application">
        <section className="catalog">
          <div className="catalog-header">
            <h1>Catalog</h1>

            <p>Select a boat to view its information.</p>
          </div>

          <ul className="catalog-list">
            <li className="catalog-item selected">
              <span className="catalog-item-name">Sharpened Iron</span>

              <span className="catalog-item-id">BOAT-0001</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Sola Fide</span>

              <span className="catalog-item-id">BOAT-0002</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Sola Gratia</span>

              <span className="catalog-item-id">BOAT-0003</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Tymann</span>

              <span className="catalog-item-id">BOAT-0004</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Tenny Gold</span>

              <span className="catalog-item-id">BOAT-0005</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Eaglewing</span>

              <span className="catalog-item-id">BOAT-0006</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">TAH</span>

              <span className="catalog-item-id">BOAT-0007</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Umbani</span>

              <span className="catalog-item-id">BOAT-0008</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Outta Gum</span>

              <span className="catalog-item-id">BOAT-0009</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Blulie</span>

              <span className="catalog-item-id">BOAT-0010</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Eleventh Item</span>

              <span className="catalog-item-id">BOAT-0011</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Twelfth Item</span>

              <span className="catalog-item-id">BOAT-0012</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Thirteenth Item</span>

              <span className="catalog-item-id">BOAT-0013</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Fourteenth Item</span>

              <span className="catalog-item-id">BOAT-0014</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Fifteenth Item</span>

              <span className="catalog-item-id">BOAT-0015</span>
            </li>

            <li className="catalog-item">
              <span className="catalog-item-name">Fifteenth Item</span>

              <span className="catalog-item-id">BOAT-0015</span>
            </li>
          </ul>

          <li className="catalog-item">
            <span className="catalog-item-name">Fifteenth Item</span>

            <span className="catalog-item-id">BOAT-0015</span>
          </li>
        </section>

        <section className="details">
          <section className="pane">
            <div className="pane-header">
              <h2>Item Information</h2>

              <span>BOAT-0001</span>
            </div>

            <div className="pane-content">
              <h3 className="record-title">Sharpened Iron</h3>

              <p className="record-id">ID: BOAT-0001</p>

              <div className="fields">
                <div className="field">
                  <div className="field-label">Name</div>

                  <div className="field-value">Sharpened Iron</div>
                </div>

                <div className="field">
                  <div className="field-label">Category</div>

                  <div className="field-value">Double</div>
                </div>

                <div className="field">
                  <div className="field-label">Status</div>

                  <div className="field-value">Active</div>
                </div>

                <div className="field">
                  <div className="field-label">Created</div>

                  <div className="field-value">September 30, 2026</div>
                </div>

                <div className="field full-width">
                  <div className="field-label">Notes</div>

                  <div className="field-value description">
                    <textarea>
                      {" "}
                      Sharpened Iron. Keeps being run aground - many fiberglass
                      repairs. Tim's favorite boat. Seats hurt Robert's
                      back.{" "}
                    </textarea>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pane">
            <div className="pane-header">
              <h2>Repairs</h2>

              <span>5 records</span>
            </div>

            <div className="pane-content">
              <div className="linked-list">
                <article className="linked-record">
                  <div className="linked-record-top">
                    <div className="linked-record-title">Hull - Fiberglass</div>

                    <div className="linked-record-type">Type A</div>
                  </div>

                  <div className="linked-record-id">RECORD-1001</div>

                  <div className="linked-record-description">
                    Information about the first record linked to this item.
                  </div>
                </article>

                <article className="linked-record">
                  <div className="linked-record-top">
                    <div className="linked-record-title">Oarlock</div>

                    <div className="linked-record-type">Type B</div>
                  </div>

                  <div className="linked-record-id">RECORD-1002</div>

                  <div className="linked-record-description">
                    Information about another record associated with the
                    selected item.
                  </div>
                </article>

                <article className="linked-record">
                  <div className="linked-record-top">
                    <div className="linked-record-title">Backstay</div>

                    <div className="linked-record-type">Type A</div>
                  </div>

                  <div className="linked-record-id">RECORD-1003</div>

                  <div className="linked-record-description">
                    Additional information about this relationship.
                  </div>
                </article>

                <article className="linked-record">
                  <div className="linked-record-top">
                    <div className="linked-record-title">Steering Cables</div>

                    <div className="linked-record-type">Type C</div>
                  </div>

                  <div className="linked-record-id">RECORD-1004</div>

                  <div className="linked-record-description">
                    Steering cables and rudder went mysteriously missing.
                  </div>
                </article>

                <article className="linked-record">
                  <div className="linked-record-top">
                    <div className="linked-record-title">Repair Five</div>

                    <div className="linked-record-type">Type B</div>
                  </div>

                  <div className="linked-record-id">RECORD-1005</div>

                  <div className="linked-record-description">
                    Additional related information.
                  </div>
                </article>
              </div>
            </div>
          </section>
        </section>
      </main>
    </body>
  );
}

export default Boats;
