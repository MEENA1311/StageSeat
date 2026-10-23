import React, { useEffect, useState } from "react";
import {
  Ticket,
  Search,
  MapPin,
  CalendarDays,
  Clock,
  X,
  CheckCircle2,
  ArrowUpRight,
  Armchair,
  Heart,
  UserRound,
  LoaderCircle,
} from "lucide-react";
import "./styles.css";

const API = "/api";

function App() {
  const [shows, setShows] = useState([]);
  const [active, setActive] = useState(null);
  const [modal, setModal] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [lastBooking, setLastBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
});
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const loadShows = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/shows`);
      if (!response.ok) {
        throw new Error("Unable to load shows.");
      }

      const data = await response.json();

      // Supports APIs that return an array or { shows: [...] }.
      const list = Array.isArray(data) ? data : data.shows || [];
      setShows(list);
    } catch (err) {
      setError(
        "Could not load shows. Please check that the backend is running."
      );
      console.error("Load shows error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  const filteredShows = shows.filter((show) => {
    const query = search.toLowerCase();

    return (
      (show.title || show.name || "").toLowerCase().includes(query) ||
      (show.venue || show.location || "").toLowerCase().includes(query) ||
      (show.category || "").toLowerCase().includes(query)
    );
  });

  const openShow = (show) => {
    setActive(show);
    setSelectedSeats([]);
    setModal("show");
  };

  const closeModal = () => {
    setModal("");
    setActive(null);
    setSelectedSeats([]);
  };

  const getShowTitle = (show) => show?.title || show?.name || "Theatre Show";

  const getShowPrice = (show) =>
    Number(show?.price ?? show?.ticketPrice ?? 250);

  const getShowImage = (show) =>
    show?.image ||
    show?.imageUrl ||
    "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80";

  const getShowVenue = (show) =>
    show?.venue || show?.location || "Local Theatre";

  const getShowDate = (show) =>
    show?.date
      ? new Date(show.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Date to be announced";

  const toggleSeat = (label) => {
    if ((active?.bookedSeats || []).includes(label)) {
      notify("This seat has already been booked.");
      return;
    }

    setSelectedSeats((current) =>
      current.includes(label)
        ? current.filter((seat) => seat !== label)
        : [...current, label]
    );
  };

  const book = async () => {
    if (!active) return;

    if (!token) {
      setAuthMode("login");
      setModal("login");
      notify("Please log in to reserve your seats.");
      return;
    }

    if (selectedSeats.length === 0) {
      notify("Please select at least one seat.");
      return;
    }

    setBooking(true);

    try {
      const response = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showId: active._id,
          seatLabels: selectedSeats,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 409
              ? "One or more seats have already been booked."
              : "Booking failed. Please try again.")
        );
      }
      setLastBooking(data);
      setModal("confirmed");
      notify("Your seats have been reserved successfully!");
      await loadShows();

      setModal("confirmed");
      notify("Your seats have been reserved successfully!");
      await loadShows();
    } catch (err) {
      notify(err.message || "Unable to complete your booking.");
      await loadShows();
    } finally {
      setBooking(false);
    }
  };

  
const submitAuth = async (event) => {
  event.preventDefault();
  setAuthLoading(true);
  setAuthError("");

  const mode = modal;
  const endpoint =
    mode === "register"
      ? `${API}/auth/register`
      : `${API}/auth/login`;

  const payload =
    mode === "register"
      ? { name: userName.trim(), email: email.trim(), password }
      : { email: email.trim(), password };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed.");
    }

    const receivedToken = data.token || data.accessToken;
    const user = data.user || data.userData || {
      name: mode === "register" ? userName.trim() : email.split("@")[0],
      email: email.trim(),
    };

    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    // Your backend must return a token for this login flow.
    if (!receivedToken) {
      throw new Error(
        "The server did not return a login token. Check your backend auth route."
      );
    }

    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);

    setAuthError("");
    setModal("");
    setPassword("");
    setUserName("");
    setEmail("");

    notify(
      mode === "register"
        ? "Account created successfully!"
        : "Logged in successfully!"
    );
  } catch (err) {
    // Keep the form and entered details visible.
    setAuthError(err.message || "Unable to authenticate.");
  } finally {
    setAuthLoading(false);
  }
};


  const toggleFavorite = (showId) => {
    setFavorites((current) =>
      current.includes(showId)
        ? current.filter((id) => id !== showId)
        : [...current, showId]
    );
  };


  const seatRows = ["A", "B", "C", "D", "E", "F", "G", "H"];
 
const loadBookingHistory = async () => {
  const savedToken = localStorage.getItem("token");

  if (!savedToken) {
    setAuthError("");
    setAuthMode("login");
    setModal("login");
    notify("Please log in to view your bookings.");
    return;
  }

  setHistoryLoading(true);
  setHistoryError("");

  try {
    const response = await fetch(`${API}/bookings/mine`, {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      setToken("");
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not load your bookings.");
    }

    const list = Array.isArray(data) ? data : data.bookings || [];
    setBookingHistory(list);
    setModal("history");
  } catch (err) {
    setHistoryError(err.message || "Could not load your bookings.");
    notify(err.message || "Could not load your bookings.");
  } finally {
    setHistoryLoading(false);
  }
};
const cancelBooking = async (bookingId) => {
  if (!bookingId) return;

  const confirmed = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmed) return;

  const savedToken = localStorage.getItem("token");

  if (!savedToken) {
    notify("Please log in again to cancel this booking.");
    return;
  }

  try {
    const response = await fetch(`${API}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Could not cancel this booking."
      );
    }

    notify("Booking cancelled successfully.");

    // Reload bookings so the cancelled booking
    // immediately appears with its new status.
    await loadBookingHistory();

    // Refresh shows so the released seats become available.
    await loadShows();
  } catch (err) {
    notify(err.message || "Could not cancel this booking.");
  }
};

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={() => {
            setModal("");
            setActive(null);
          }}
        >
          <span className="brand-icon">
            <Ticket size={23} />
          </span>
          <span>StageSeat</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#shows">Explore Shows</a>
          <a href="#about">About</a>
        </nav>
<div className="nav-actions">
  {currentUser ? (
    <div className="profile-menu">
      <button
        className="profile-btn"
        onClick={() => setModal("profile")}
      >
        <span className="profile-avatar">
          {(currentUser.name || currentUser.email || "U")
            .charAt(0)
            .toUpperCase()}
        </span>

        <span className="profile-text">
          <strong>{currentUser.name || "My Account"}</strong>
          <small>View profile</small>
        </span>
      </button>

      <button
        className="login-btn"
        onClick={loadBookingHistory}
        disabled={historyLoading}
      >
        <Ticket size={17} />
        My Bookings
      </button>
    </div>
  ) : (
    <>
      <button
        className="login-btn"
        onClick={() => {
          setAuthMode("login");
          setAuthError("");
          setModal("login");
        }}
      >
        <UserRound size={17} />
        Log in
      </button>

      <button
        className="primary-btn nav-cta"
        onClick={() => {
          setAuthMode("register");
          setAuthError("");
          setModal("register");
        }}
      >
        Get Started <ArrowUpRight size={17} />
      </button>
    </>
  )}
</div>

      </header>

      <main>
        {/* Hero */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT LIVE EXPERIENCE STARTS HERE
            </div>

            <h1>
              Every seat has
              <br />
              a <span>story.</span>
            </h1>

            <p className="hero-description">
              Discover local theatre, experience unforgettable performances,
              and reserve your perfect seat in just a few clicks.
            </p>

            <div className="hero-actions">
              <a href="#shows" className="primary-btn">
                Explore shows <ArrowUpRight size={18} />
              </a>

              <div className="hero-note">
                <CheckCircle2 size={17} />
                Simple, secure reservations
              </div>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{shows.length}+</strong>
                <span>Shows to explore</span>
              </div>
              <div>
                <strong>Easy</strong>
                <span>Seat selection</span>
              </div>
              <div>
                <strong>Live</strong>
                <span>Theatre experiences</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=85"
              alt="A dramatic theatre stage"
            />

            <div className="hero-image-caption">
              <span className="caption-icon">
                <Ticket size={20} />
              </span>
              <div>
                <strong>Your next favourite show</strong>
                <span>Find it. Book it. Experience it.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="explore-section" id="shows">
          <div className="section-heading">
            <div>
              <p className="section-kicker">THE STAGE IS YOURS</p>
              <h2>Find your next show</h2>
              <p className="section-description">
                From timeless drama to unforgettable live performances.
              </p>
            </div>

            <div className="show-count">
              <Ticket size={17} />
              {filteredShows.length} shows
            </div>
          </div>

          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search shows, venues or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {loading && (
            <div className="status-message">
              <LoaderCircle className="spin" size={24} />
              <p>Loading theatre shows...</p>
            </div>
          )}

          {!loading && error && (
            <div className="status-message error-message">
              <p>{error}</p>
              <button className="primary-btn" onClick={loadShows}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredShows.length === 0 && (
            <div className="empty-state">
              <Ticket size={35} />
              <h3>No shows found</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "There are no shows available right now."}
              </p>
            </div>
          )}

          {!loading && filteredShows.length > 0 && (
            <div className="shows-grid">
              {filteredShows.map((show) => (
                <article className="show-card" key={show._id || show.id}>
                  <div className="show-image">
                    <img
                      src={getShowImage(show)}
                      alt={getShowTitle(show)}
                      loading="lazy"
                    />

                    <span className="show-category">
                      {show.category || "Live Theatre"}
                    </span>

                    <button
                      className={`favorite-btn ${
                        favorites.includes(show._id || show.id)
                          ? "is-favorite"
                          : ""
                      }`}
                      onClick={() => toggleFavorite(show._id || show.id)}
                      aria-label="Toggle favourite"
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(show._id || show.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className="show-card-content">
                    <h3>{getShowTitle(show)}</h3>

                    <p className="show-venue">
                      <MapPin size={16} />
                      {getShowVenue(show)}
                    </p>

                    <div className="show-details">
                      <span>
                        <CalendarDays size={15} />
                        {getShowDate(show)}
                      </span>
                      <span>
                        <Clock size={15} />
                        {show.time || "Time TBA"}
                      </span>
                    </div>

                    <div className="show-card-footer">
                      <div className="show-price">
                        <span>Tickets from</span>
                        <strong>₹{getShowPrice(show)}</strong>
                      </div>

                      <button
                        className="book-btn"
                        onClick={() => openShow(show)}
                      >
                        Book seats <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        <section className="about-section" id="about">
          <div className="about-icon">
            <Armchair size={30} />
          </div>
          <p className="section-kicker">A BETTER WAY TO BOOK</p>
          <h2>Make room for a little magic.</h2>
          <p>
            StageSeat makes discovering performances and choosing your seats
            easier, so you can spend less time planning and more time enjoying
            the show.
          </p>
          <a href="#shows" className="primary-btn">
            Discover performances <ArrowUpRight size={17} />
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">
            <Ticket size={21} />
          </span>
          <span>StageSeat</span>
        </a>
        <p>Discover local theatre. Make unforgettable memories.</p>
        <span>© {new Date().getFullYear()} StageSeat</span>
      </footer>

      {/* Modal backdrop */}
      {modal !== "" && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={21} />
            </button>

            {/* Show details and seat selection */}
            {modal === "show" && active && (
              <>
                <div className="modal-show-image">
                  <img src={getShowImage(active)} alt={getShowTitle(active)} />
                </div>

                <div className="modal-content">
                  <p className="section-kicker">RESERVE YOUR EXPERIENCE</p>
                  <h2>{getShowTitle(active)}</h2>

                  <p className="show-venue">
                    <MapPin size={16} />
                    {getShowVenue(active)}
                  </p>

                  <div className="modal-show-details">
                    <span>
                      <CalendarDays size={16} />
                      {getShowDate(active)}
                    </span>
                    <span>
                      <Clock size={16} />
                      {active.time || "Time TBA"}
                    </span>
                  </div>

                  <div className="seat-section">
                    <div className="seat-section-heading">
                      <h3>Select your seats</h3>
                      <span>
                        {selectedSeats.length} selected
                      </span>
                    </div>

                    <div className="seat-legend">
                      <span>
                        <i className="legend-seat available" />
                        Available
                      </span>
                      <span>
                        <i className="legend-seat selected" />
                        Selected
                      </span>
                      <span>
                        <i className="legend-seat booked" />
                        Booked
                      </span>
                    </div>

                    <div className="stage-label">STAGE</div>

                    <div className="seat-chart">
                      {seatRows.map((row) => (
                        <div className="seat-row" key={row}>
                          <span className="row-label">{row}</span>

                          {Array.from({ length: 10 }, (_, index) => {
                            const label = `${row}${String(index + 1).padStart(
                              2,
                              "0"
                            )}`;

                            const isBooked = (
                              active.bookedSeats || []
                            ).includes(label);

                            const isSelected =
                              selectedSeats.includes(label);

                            return (
                              <button
                                key={label}
                                type="button"
                                className={`seat ${
                                  isBooked
                                    ? "booked"
                                    : isSelected
                                    ? "selected"
                                    : "available"
                                }`}
                                disabled={isBooked}
                                onClick={() => toggleSeat(label)}
                                title={
                                  isBooked
                                    ? `${label} is booked`
                                    : `Select seat ${label}`
                                }
                                aria-label={`Seat ${label}`}
                              >
                                {index + 1}
                              </button>
                            );
                          })}

                          <span className="row-label">{row}</span>
                        </div>
                      ))}
                    </div>

                    <p className="seat-help">
                      Select one or more available seats.
                    </p>
                  </div>

                  <div className="total-row">
                    <div>
                      <span>Total amount</span>
                      <small>
                        {selectedSeats.length} seat
                        {selectedSeats.length === 1 ? "" : "s"} × ₹
                        {getShowPrice(active)}
                      </small>
                    </div>

                    <strong>
                      ₹
                      {(
                        selectedSeats.length * getShowPrice(active)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <button
                    className="primary-btn modal-book"
                    onClick={book}
                    disabled={booking || selectedSeats.length === 0}
                  >
                    {booking ? (
                      <>
                        <LoaderCircle className="spin" size={18} />
                        Reserving seats...
                      </>
                    ) : (
                      <>
                        Reserve my seats <ArrowUpRight size={17} />
                      </>
                    )}
                  </button>

                  <p className="secure-note">
                    <CheckCircle2 size={14} />
                    No payment is collected in this demo.
                  </p>
                </div>
              </>
            )}

{/* My Bookings */}
{modal === "history" && (
  <div className="history-content">
    <p className="section-kicker">YOUR STAGESEAT ACCOUNT</p>
    <h2>My Bookings</h2>
    <p className="auth-description">
      Your reservations, all in one place.
    </p>

    {historyError && (
      <p className="form-error" role="alert">
        {historyError}
      </p>
    )}

    {historyLoading ? (
      <div className="status-message">
        <LoaderCircle className="spin" size={24} />
        <p>Loading your tickets...</p>
      </div>
    ) : bookingHistory.length === 0 ? (
      <div className="empty-state">
        <Ticket size={35} />
        <h3>No bookings yet</h3>
        <p>Your confirmed reservations will appear here.</p>
        <button
          className="primary-btn"
          onClick={() => {
            closeModal();
            document.getElementById("shows")?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        >
          Explore shows <ArrowUpRight size={17} />
        </button>
      </div>
    ) : (
      <div className="booking-history-list">
        {bookingHistory.map((bookingItem, index) => {
            const show =
              bookingItem.show &&
              typeof bookingItem.show === "object"
                ? bookingItem.show
                : {};

          const title =
            show.title ||
            show.name ||
            bookingItem.showTitle ||
            "Theatre Show";

          const seats =
            bookingItem.seatLabels ||
            bookingItem.seats ||
            bookingItem.seatNumbers ||
            [];

          const seatList = Array.isArray(seats)
            ? seats.map((seat) =>
                typeof seat === "object"
                  ? seat.label || seat.seatLabel || seat.number
                  : seat
              )
            : [seats];

          const total = Number(bookingItem.total || 0);

          const bookingDate =
            bookingItem.createdAt || bookingItem.bookingDate;

          const status = bookingItem.status || "Confirmed";

          return (
            <article
              className="history-ticket"
              key={bookingItem._id || bookingItem.id || index}
            >
              <div className="history-ticket-top">
                <div className="history-ticket-icon">
                  <Ticket size={23} />
                </div>
                <div className="history-ticket-title">
                  <h3>{title}</h3>
                  <span>
                    {show.venue || show.location || "Local Theatre"}
                  </span>
                </div>
                <span
                  className={`booking-status ${
                    String(status).toLowerCase() === "cancelled"
                      ? "cancelled"
                      : "confirmed"
                  }`}
                >
                  {String(status).toLowerCase() === "cancelled"
                    ? "Cancelled"
                    : "Confirmed"}
                </span>
              </div>

              <div className="history-ticket-details">
                <div>
                  <span>Date</span>
                  <strong>
                    {show.date
                      ? new Date(show.date).toLocaleDateString("en-IN")
                      : "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>{show.time || "Not available"}</strong>
                </div>

                <div>
                  <span>Seats</span>
                  <strong>
                    {seatList.filter(Boolean).join(", ") || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    ₹{Number.isFinite(total) ? total.toLocaleString("en-IN") : "0"}
                  </strong>
                </div>
              </div>

              <div className="history-ticket-footer">
            <div>
              <span>
                Booking ID: {bookingItem.bookingCode || bookingItem._id}
              </span>

              {bookingDate && (
                <span>
                  Booked on{" "}
                  {new Date(bookingDate).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>

            {String(status).toLowerCase() === "cancelled" ? (
              <span className="cancelled-label">
                Booking cancelled
              </span>
            ) : (
              <button
                className="cancel-booking-btn"
                onClick={() =>
                  cancelBooking(bookingItem._id || bookingItem.id)
                }
              >
                Cancel Booking
              </button>
            )}
          </div>
                      </article>
                    );
                  })}
                </div>
    )}

    <button
      className="primary-btn auth-submit"
      onClick={loadBookingHistory}
      disabled={historyLoading}
    >
      <LoaderCircle
        size={17}
        className={historyLoading ? "spin" : ""}
      />
      Refresh bookings
    </button>
  </div>
)}

{/* User Profile */}
{modal === "profile" && currentUser && (
  <div className="auth-content">
    <div className="profile-avatar profile-avatar-large">
      {(currentUser.name || currentUser.email || "U")
        .charAt(0)
        .toUpperCase()}
    </div>

    <p className="section-kicker">YOUR ACCOUNT</p>
    <h2>{currentUser.name || "StageSeat User"}</h2>
    <p className="auth-description">
      {currentUser.email}
    </p>

    <button
      className="primary-btn auth-submit"
      onClick={() => {
        closeModal();
        loadBookingHistory();
      }}
    >
      <Ticket size={17} />
      View my bookings
    </button>

    <button
      className="login-btn"
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken("");
        setCurrentUser(null);
        setBookingHistory([]);
        closeModal();
        notify("You have logged out.");
      }}
    >
      Log out
    </button>
  </div>
)}

            {/* Login and registration */}
            {(modal === "login" || modal === "register") && (
              <div className="auth-content">
                <div className="auth-icon">
                  <Ticket size={28} />
                </div>

                <p className="section-kicker">WELCOME TO STAGESEAT</p>

                <h2>
                  {modal === "register"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <p className="auth-description">
                  {modal === "register"
                    ? "Join us and discover your next favourite performance."
                    : "Log in to reserve your favourite theatre seats."}
                </p>

                <form onSubmit={submitAuth}>
                  {modal === "register" && (
                    <label className="form-field">
                      Full name
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(event) => setUserName(event.target.value)}
                        required
                      />
                    </label>
                  )}

                  <label className="form-field">
                    Email address
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>

                  <label className="form-field">
                    Password
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </label>

                  <button className="primary-btn auth-submit" type="submit">
                    {modal === "register" ? "Create account" : "Log in"}
                    <ArrowUpRight size={17} />
                  </button>
                </form>

                <p className="auth-switch">
                  {modal === "register"
                    ? "Already have an account?"
                    : "New to StageSeat?"}{" "}
                  <button
                    onClick={() => {
                      const nextMode =
                        modal === "register" ? "login" : "register";

                      setAuthMode(nextMode);
                      setModal(nextMode);
                    }}
                  >
                    {modal === "register" ? "Log in" : "Sign up"}
                  </button>
                </p>
              </div>
            )}

            {/* Booking confirmation */}
            {modal === "confirmed" && (
              <div className="confirmed-content">
                <div className="confirmed-icon">
                  <CheckCircle2 size={43} />
                </div>

                <p className="section-kicker">RESERVATION COMPLETE</p>
                <h2>Your seats are reserved!</h2>

                <p>
                  Your booking request for{" "}
                  <strong>{getShowTitle(active)}</strong> was successful.
                </p>

                <div className="confirmation-details">
                  {lastBooking && (
  <div className="confirmation-details">
    <span>Booking reference</span>
    <strong>{lastBooking.bookingCode || lastBooking._id}</strong>

    <span>Show</span>
    <strong>
      {lastBooking.show?.title ||
        lastBooking.show?.name ||
        getShowTitle(active)}
    </strong>

    <span>Seats</span>
    <strong>
      {(lastBooking.seatLabels || []).join(", ")}
    </strong>

    <span>Total amount</span>
    <strong>
      ₹{Number(lastBooking.total || 0).toLocaleString("en-IN")}
    </strong>
  </div>
)}
                </div>

                <button
                  className="primary-btn auth-submit"
                  onClick={closeModal}
                >
                  Done <CheckCircle2 size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button
            className="toast-close"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Help button */}
      <button
        className="help-fab"
        onClick={() =>
          notify("Need help? Contact the venue listed on your show details.")
        }
        title="Help"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
}

export default App;