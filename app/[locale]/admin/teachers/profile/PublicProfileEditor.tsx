"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  Check,
  Loader2,
  Pencil,
  X,
} from "lucide-react";

type PublicProfileEditorProps = {
  initialFullName: string;
  initialCardLabel: string;
  initialLearnerGroups: string[];
  updateAction: (formData: FormData) => Promise<void>;
};

const learnerGroupOptions = [
  "Kids",
  "Teens",
  "Adults",
];

export default function PublicProfileEditor({
  initialFullName,
  initialCardLabel,
  initialLearnerGroups,
  updateAction,
}: PublicProfileEditorProps) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const [fullName, setFullName] =
    useState(initialFullName);

  const [cardLabel, setCardLabel] =
    useState(initialCardLabel);

  const [learnerGroups, setLearnerGroups] =
    useState<string[]>(
      initialLearnerGroups
    );

  const [savedFullName, setSavedFullName] =
    useState(initialFullName);

  const [savedCardLabel, setSavedCardLabel] =
    useState(initialCardLabel);

  const [
    savedLearnerGroups,
    setSavedLearnerGroups,
  ] = useState<string[]>(
    initialLearnerGroups
  );

  const [message, setMessage] =
    useState<string | null>(null);

  function toggleLearnerGroup(
    group: string
  ) {
    setLearnerGroups((current) =>
      current.includes(group)
        ? current.filter(
            (item) => item !== group
          )
        : [...current, group]
    );
  }

  function cancelEditing() {
    setFullName(savedFullName);
    setCardLabel(savedCardLabel);
    setLearnerGroups(
      savedLearnerGroups
    );
    setMessage(null);
    setIsEditing(false);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage(null);

    const trimmedFullName =
      fullName.trim();

    const trimmedCardLabel =
      cardLabel.trim();

    if (!trimmedFullName) {
      setMessage(
        "Please enter your name."
      );
      return;
    }

    if (!trimmedCardLabel) {
      setMessage(
        "Please enter a profile label."
      );
      return;
    }

    if (learnerGroups.length === 0) {
      setMessage(
        "Please select at least one learner group."
      );
      return;
    }

    const formData = new FormData();

    formData.set(
      "full_name",
      trimmedFullName
    );

    formData.set(
      "card_label",
      trimmedCardLabel
    );

    formData.set(
      "learner_groups",
      JSON.stringify(learnerGroups)
    );

    startTransition(async () => {
      try {
        await updateAction(formData);

        setFullName(trimmedFullName);
        setCardLabel(trimmedCardLabel);

        setSavedFullName(
          trimmedFullName
        );

        setSavedCardLabel(
          trimmedCardLabel
        );

        setSavedLearnerGroups([
          ...learnerGroups,
        ]);

        setMessage(
          "Profile information saved."
        );

        setIsEditing(false);
      } catch {
        setMessage(
          "We couldn't save your changes. Please try again."
        );
      }
    });
  }

  if (!isEditing) {
    return (
      <div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setIsEditing(true);
            }}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#C8D4C3]
              px-4
              py-2
              font-sans
              text-[13px]
              font-medium
              text-[#526B55]
              transition-colors
              hover:bg-[#EEF2EA]
            "
          >
            <Pencil
              size={14}
              strokeWidth={1.7}
            />

            Edit
          </button>
        </div>

        <div className="mt-2 space-y-6">
          <DisplayField
            label="Name"
            value={
              savedFullName ||
              "Not added"
            }
          />

          <DisplayField
            label="Profile label"
            value={
              savedCardLabel ||
              "Not added"
            }
          />

          <div>
            <p className={fieldLabelClass}>
              Learner groups
            </p>

            {savedLearnerGroups.length >
            0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {savedLearnerGroups.map(
                  (group) => (
                    <span
                      key={group}
                      className="
                        rounded-full
                        bg-[#EEF2EA]
                        px-4
                        py-2
                        font-sans
                        text-[13px]
                        text-[#526B55]
                      "
                    >
                      {group}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className={fieldValueClass}>
                Not added
              </p>
            )}
          </div>
        </div>

        {message ? (
          <p
            className="
              mt-5
              font-sans
              text-[13px]
              text-[#6F8F72]
            "
          >
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="teacher-full-name"
          className={fieldLabelClass}
        >
          Name
        </label>

        <input
          id="teacher-full-name"
          type="text"
          value={fullName}
          onChange={(event) =>
            setFullName(
              event.target.value
            )
          }
          disabled={isPending}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="teacher-card-label"
          className={fieldLabelClass}
        >
          Profile label
        </label>

        <input
          id="teacher-card-label"
          type="text"
          value={cardLabel}
          onChange={(event) =>
            setCardLabel(
              event.target.value
            )
          }
          disabled={isPending}
          className={inputClass}
        />

        <p
          className="
            mt-2
            font-sans
            text-[12px]
            leading-5
            text-[#8A8780]
          "
        >
          A short description shown
          with your teacher profile.
        </p>
      </div>

      <div>
        <p className={fieldLabelClass}>
          Learner groups
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {learnerGroupOptions.map(
            (group) => {
              const selected =
                learnerGroups.includes(
                  group
                );

              return (
                <button
                  key={group}
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    toggleLearnerGroup(
                      group
                    )
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-4
                    py-2
                    font-sans
                    text-[13px]
                    transition-colors
                    ${
                      selected
                        ? "border-[#718A73] bg-[#DCE4D7] text-[#3F5944]"
                        : "border-[#D8D4CD] bg-transparent text-[#68655F] hover:border-[#AEBDAA]"
                    }
                  `}
                >
                  {selected ? (
                    <Check
                      size={13}
                      strokeWidth={2}
                    />
                  ) : null}

                  {group}
                </button>
              );
            }
          )}
        </div>
      </div>

      {message ? (
        <p
          className="
            font-sans
            text-[13px]
            text-[#A35F53]
          "
        >
          {message}
        </p>
      ) : null}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
          pt-2
        "
      >
        <button
          type="submit"
          disabled={isPending}
          className="
            inline-flex
            min-w-[126px]
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#718A73]
            px-5
            py-3
            font-sans
            text-[13px]
            font-medium
            text-white
            transition-colors
            hover:bg-[#5F7863]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isPending ? (
            <>
              <Loader2
                size={14}
                className="animate-spin"
              />

              Saving
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={cancelEditing}
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            px-4
            py-3
            font-sans
            text-[13px]
            text-[#77736C]
            transition-colors
            hover:text-[#444640]
            disabled:opacity-50
          "
        >
          <X
            size={14}
            strokeWidth={1.7}
          />

          Cancel
        </button>
      </div>
    </form>
  );
}

const fieldLabelClass = `
  block
  font-sans
  text-[11px]
  font-semibold
  uppercase
  tracking-[0.12em]
  text-[#8A8A84]
`;

const fieldValueClass = `
  mt-2
  font-serif
  text-[18px]
  leading-7
  text-[#444640]
`;

const inputClass = `
  mt-3
  w-full
  rounded-[12px]
  border
  border-[#D8D4CD]
  bg-[#FFFDF8]
  px-4
  py-3
  font-serif
  text-[17px]
  text-[#333630]
  outline-none
  transition
  placeholder:text-[#AAA69F]
  focus:border-[#8FA58F]
  focus:ring-2
  focus:ring-[#DCE4D7]
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

function DisplayField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className={fieldLabelClass}>
        {label}
      </p>

      <p className={fieldValueClass}>
        {value}
      </p>
    </div>
  );
}