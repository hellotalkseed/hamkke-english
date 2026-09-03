"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type StatusOption = {
  value: string;
  label: string;
};

type SearchFiltersProps = {
  locale: string;
  statusOptions: StatusOption[];
  studentSearch: string;
  numberSearch: string;
  statusFilter: string;
};

export default function SearchFilters({
  locale,
  statusOptions,
  studentSearch: initialStudentSearch,
  numberSearch: initialNumberSearch,
  statusFilter: initialStatusFilter,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [studentSearch, setStudentSearch] =
    useState(initialStudentSearch);

  const [numberSearch, setNumberSearch] =
    useState(initialNumberSearch);

  const [status, setStatus] =
    useState(initialStatusFilter);

  const isFirstRender = useRef(true);

  /* ----------------------------------------------------------------------- */
  /* UPDATE URL                                                              */
  /* ----------------------------------------------------------------------- */

  const updateSearch = (
    student: string,
    number: string,
    selectedStatus: string
  ) => {
    const params = new URLSearchParams();

    if (student.trim()) {
      params.set(
        "student",
        student.trim()
      );
    }

    if (number.trim()) {
      params.set(
        "number",
        number.trim()
      );
    }

    if (selectedStatus) {
      params.set(
        "status",
        selectedStatus
      );
    }

    const query = params.toString();

    const url = query
      ? `${pathname}?${query}`
      : pathname;

    /*
     * scroll: false is important here.
     *
     * Next.js will update the page data without
     * moving the user back to the top.
     */
    router.replace(url, {
      scroll: false,
    });
  };

  /* ----------------------------------------------------------------------- */
  /* LIVE SEARCH                                                             */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    /*
     * Don't trigger a navigation when the page
     * initially loads.
     */
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    /*
     * Wait 300ms after the user's last keystroke.
     *
     * This makes the search feel immediate while
     * avoiding a navigation for every single
     * character typed.
     */
    const timeout = setTimeout(() => {
      updateSearch(
        studentSearch,
        numberSearch,
        status
      );
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    studentSearch,
    numberSearch,
    status,
  ]);

  /* ----------------------------------------------------------------------- */
  /* URL SYNCHRONIZATION                                                     */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    const urlStudent =
      searchParams.get("student") ?? "";

    const urlNumber =
      searchParams.get("number") ?? "";

    const urlStatus =
      searchParams.get("status") ?? "";

    if (urlStudent !== studentSearch) {
      setStudentSearch(urlStudent);
    }

    if (urlNumber !== numberSearch) {
      setNumberSearch(urlNumber);
    }

    if (urlStatus !== status) {
      setStatus(urlStatus);
    }
  }, [searchParams]);

  /* ----------------------------------------------------------------------- */
  /* FORM SUBMIT                                                             */
  /* ----------------------------------------------------------------------- */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    updateSearch(
      studentSearch,
      numberSearch,
      status
    );
  };

  /* ----------------------------------------------------------------------- */
  /* CLEAR                                                                   */
  /* ----------------------------------------------------------------------- */

  const hasFilters =
    Boolean(
      studentSearch.trim() ||
        numberSearch.trim() ||
        status
    );

  const handleClear = () => {
    setStudentSearch("");
    setNumberSearch("");
    setStatus("");

    router.replace(
      `/${locale}/admin`,
      {
        scroll: false,
      }
    );
  };

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="
        mb-7
        border-y
        border-[#DCD8D2]
        py-4
      "
    >
      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-[1fr_180px_190px_auto]
          sm:items-center
        "
      >
        {/* STUDENT NAME */}

        <div className="relative">
          <input
            type="text"
            value={studentSearch}
            onChange={(event) =>
              setStudentSearch(
                event.target.value
              )
            }
            placeholder="Search student name"
            className="
              h-[40px]
              w-full
              rounded
              border
              border-[#DCD8D2]
              bg-[#FAF8F5]
              px-3.5
              font-serif
              text-[14px]
              text-[#292929]
              outline-none
              transition-colors
              placeholder:text-[#A09C95]
              focus:border-[#9AA998]
            "
          />
        </div>

        {/* STUDENT NUMBER */}

        <div className="relative">
          <span
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              font-sans
              text-[12px]
              font-medium
              tracking-[0.08em]
              text-[#77736B]
            "
          >
            HK
          </span>

          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={numberSearch}
            onChange={(event) =>
              setNumberSearch(
                event.target.value
              )
            }
            placeholder="Last 4 digits"
            className="
              h-[40px]
              w-full
              rounded
              border
              border-[#DCD8D2]
              bg-[#FAF8F5]
              pl-9
              pr-3.5
              font-sans
              text-[12px]
              tracking-[0.08em]
              text-[#292929]
              outline-none
              transition-colors
              placeholder:text-[#A09C95]
              focus:border-[#9AA998]
            "
          />
        </div>

        {/* STATUS */}

        <div className="relative">
          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="
              h-[40px]
              w-full
              appearance-none
              rounded
              border
              border-[#DCD8D2]
              bg-[#FAF8F5]
              px-3.5
              pr-9
              font-sans
              text-[12px]
              text-[#55544F]
              outline-none
              transition-colors
              focus:border-[#9AA998]
            "
          >
            <option value="">
              All statuses
            </option>

            {statusOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <span
            className="
              pointer-events-none
              absolute
              right-3.5
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-[#8A8A84]
            "
          >
            ▾
          </span>
        </div>

        {/* BUTTONS */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <button
            type="submit"
            className="
              h-[40px]
              rounded
              bg-[#6F8F72]
              px-5
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.1em]
              text-white
              transition-colors
              hover:bg-[#5E7961]
            "
          >
            Search
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="
                font-sans
                text-[11px]
                text-[#8A8A84]
                underline
                underline-offset-4
                transition-colors
                hover:text-[#6F8F72]
              "
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </form>
  );
}