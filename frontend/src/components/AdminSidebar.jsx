// src/components/AdminSidebar.jsx

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminSidebar({ open, setOpen }) {
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Crisis Analytics",
      path: "/admin/analytics",
    },
    {
      name: "Incident Command Map",
      path: "/admin/map",
    },
    {
      name: "Report Verification",
      path: "/admin/report-verification",
    },
    {
      name: "Task Assignment Board",
      path: "/admin/task-board",
    },
    {
      name: "Stage Feed",
      path: "/admin/stage-feed",
    },
    {
      name: "Weather",
      path: "/admin/weather",
    },
    {
      name: "Severity Threshold",
      path: "/admin/severity-threshold",
    },
    {
      name: "Shelter Directory",
      path: "/admin/shelters",
    },
    {
      name: "Manage Campaigns",
      path: "/admin/campaigns",
    },
    {
      name: "Alert Configuration",
      path: "/admin/alerts",
    },
    {
      name: "Campaign Analytics",
      path: "/admin/campaign-analytics",
    },
    {
      name: "SMS Broadcast",
      path: "/admin/sms-broadcast",
    },
    {
      name: "Email Logs",
      path: "/admin/email-logs",
    },
    {
      name: "Certificate Preview",
      path: "/admin/certificates",
    },
  ];

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      {open && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[1040]
            bg-black/40
            backdrop-blur-[1px]
            md:hidden
          "
        />
      )}

      {/* =====================================================
          ADMIN SIDEBAR

          Navbar:
          mobile = 60px
          desktop = 68px

          Sidebar begins EXACTLY below Navbar.

          IMPORTANT:
          Do not use top-0 here.
          Do not use h-screen here.

          This prevents the sidebar from appearing above
          the Navbar.
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0

          top-[60px]
          h-[calc(100vh-60px)]

          sm:top-[68px]
          sm:h-[calc(100vh-68px)]

          z-[1050]

          flex
          w-[260px]
          flex-col

          overflow-hidden

          bg-[#30475E]
          text-white

          shadow-xl

          transition-transform
          duration-300
          ease-in-out

          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div
          className="
            flex
            min-h-[76px]
            shrink-0
            items-center
            justify-between

            border-b
            border-white/10

            px-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                bg-[#00ADB5]

                text-sm
                font-bold
                text-white

                shadow-sm
              "
            >
              S
            </div>

            {/* Title */}

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-base
                  font-bold
                  leading-tight
                  tracking-wide
                  text-white
                "
              >
                DRRCS Admin
              </h2>

              <p
                className="
                  mt-1
                  truncate
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-white/50
                "
              >
                Administration Panel
              </p>
            </div>
          </div>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin sidebar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-lg

              text-lg
              text-white/60

              transition

              hover:bg-white/10
              hover:text-white

              active:bg-white/20

              md:hidden
            "
          >
            ×
          </button>
        </div>

        {/* =================================================
            NAVIGATION

            Only this section scrolls.

            Sidebar itself stays fixed.
        ================================================= */}

        <nav
          className="
            min-h-0
            flex-1

            overflow-x-hidden
            overflow-y-auto

            px-3
            py-5
          "
        >
          {/* Section title */}

          <p
            className="
              mb-3
              px-3

              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]

              text-white/40
            "
          >
            Administration
          </p>

          {/* Navigation items */}

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `
                    group
                    relative

                    flex
                    min-h-[44px]
                    w-full
                    items-center

                    rounded-xl

                    px-3
                    py-2.5

                    text-[13px]
                    font-medium

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          bg-[#00ADB5]
                          text-white
                          shadow-md
                        `
                        : `
                          text-white/70

                          hover:bg-white/[0.08]
                          hover:text-white
                        `
                    }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}

                    <span
                      className={`
                        absolute
                        left-0
                        top-1/2

                        h-6
                        w-1

                        -translate-y-1/2

                        rounded-r-full

                        bg-white

                        transition-opacity

                        ${isActive ? "opacity-100" : "opacity-0"}
                      `}
                    />

                    {/* Icon */}

                    <span
                      className={`
                        mr-3

                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center

                        rounded-lg

                        text-[11px]
                        font-bold

                        transition

                        ${
                          isActive
                            ? `
                              bg-white/15
                              text-white
                            `
                            : `
                              bg-white/[0.06]
                              text-white/50

                              group-hover:bg-white/10
                              group-hover:text-white
                            `
                        }
                      `}
                    >
                      {item.name.charAt(0)}
                    </span>

                    {/* Text */}

                    <span
                      className="
                        min-w-0
                        truncate
                        leading-5
                      "
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* =================================================
            ADMIN ACCOUNT / LOGOUT

            Always stays at bottom.
        ================================================= */}

        <div
          className="
            shrink-0

            border-t
            border-white/10

            bg-[#2B4055]

            p-3
          "
        >
          {/* Administrator */}

          <div
            className="
              mb-3

              flex
              items-center
              gap-3

              rounded-xl

              bg-white/[0.05]

              px-3
              py-2.5
            "
          >
            {/* Avatar */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-[#00ADB5]

                text-xs
                font-bold
                text-white
              "
            >
              A
            </div>

            {/* Account details */}

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-xs
                  font-semibold
                  text-white
                "
              >
                Administrator
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-green-400
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-white/50
                  "
                >
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}

          <button
            type="button"
            onClick={logout}
            className="
              flex
              min-h-[42px]
              w-full
              items-center
              justify-center
              gap-2

              rounded-xl

              border
              border-white/10

              bg-[#00ADB5]

              px-4
              py-2.5

              text-sm
              font-semibold
              text-white

              shadow-sm

              transition-all
              duration-200

              hover:bg-[#0097A0]
              hover:shadow-md

              active:scale-[0.98]
            "
          >
            <span className="text-base leading-none">↪</span>

            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
