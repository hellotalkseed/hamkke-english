"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReflectionForm() {
  const [rating, setRating] = useState(0);
const [hover, setHover] = useState(0);

const [name, setName] = useState("");
const [role, setRole] = useState("");
const [country, setCountry] = useState("");
const [reflection, setReflection] = useState("");
const [photo, setPhoto] = useState<File | null>(null);

const [submitted, setSubmitted] = useState(false);
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  try {
    setLoading(true);

    let photoUrl = null;

    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("reflections")
        .upload(fileName, photo);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("reflections")
        .getPublicUrl(fileName);

      photoUrl = data.publicUrl;
    }

    const { error } = await supabase
  .from("reflections")
  .insert({
    rating,
    name,
    role,
    country,
    reflection,
    photo_url: photoUrl,
    photo_name: photo ? photo.name : null,
  });

    if (error) {
      throw error;
    }

    setSubmitted(true);

  } catch (error) {
  console.error("SUPABASE ERROR:", error);
  alert(JSON.stringify(error));
} finally {
    setLoading(false);
  }
};

  if (submitted) {
    return (
      <section
        className="
          rounded-[3rem]
          bg-white
          p-10
          shadow-lg
          text-center
          md:p-14
        "
      >
        <h2
          className="
            text-5xl
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
          "
        >
          Thank you!
        </h2>

        <p
          className="
            mx-auto
            mt-8
            max-w-2xl
            text-lg
            leading-8
            text-[#5B5B5B]
          "
        >
          Thank you for taking the time to share your experience with
          Hamkke. Your reflection may encourage someone else to begin
          their own English journey, and I'm truly grateful you've
          chosen to share your story.
        </p>

        <p
          className="
            mt-10
            text-xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]
          "
        >
          See you in our next conversation.
        </p>

        <a
          href="/"
          className="
            mt-12
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-[#6F8F72]
            px-8
            py-4
            text-white
            transition
            hover:bg-[#5B7960]
          "
        >
          Return to Hamkke
        </a>
      </section>
    );
  }

  return (
    <section
      className="
  rounded-[2.5rem]
  bg-white
  p-6
  shadow-lg
  sm:p-8
  md:p-12
"
    >
      {/* Rating */}

<div>
  <label
    className="
      block
      text-lg
      font-medium
      text-[#2B2B2B]
    "
  >
    ⭐ How would you rate your learning experience?
    <span className="text-red-500"> *</span>
  </label>

  <div
    className="
      mt-5
      flex
      flex-col
      gap-3
      sm:flex-row
      sm:items-center
      sm:gap-4
    "
  >
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="
            cursor-pointer
            text-[1.9rem]
            sm:text-[2.2rem]
            leading-none
            transition-all
            duration-200
            hover:scale-110
            active:scale-95
          "
        >
          <span
            className={`inline-block transition-all duration-200 ${
              star <= (hover || rating)
                ? "opacity-100 saturate-100"
                : "opacity-30 grayscale"
            }`}
          >
            ⭐
          </span>
        </button>
      ))}
    </div>

    <span
      className="
        min-h-[24px]
        text-sm
        font-medium
        text-[#6F8F72]
      "
    >
      {
        {
          0: "Select a rating",
          1: "Needs Improvement",
          2: "Fair",
          3: "Good",
          4: "Great",
          5: "Excellent",
        }[hover || rating]
      }
    </span>
  </div>
</div>

      {/* Name */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          Name <span className="text-red-500">*</span>
        </label>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[#6B6B6B]
          "
        >
          Use your real name, English name, nickname, or initials—this is how
          your name will appear on the website.
        </p>

        <input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="
    mt-4
    w-full
    rounded-xl
    border
    border-[#DDE9D8]
    bg-white
    px-5
    py-3
    outline-none
    transition
    focus:border-[#6F8F72]
  "
/>
      </div>

      {/* I am a... */}

      <div className="mt-10">
        <label
          className="
            block
            text-lg
            font-medium
            text-[#2B2B2B]
          "
        >
          I am a... <span className="text-red-500">*</span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-[#DDE9D8]
              bg-white
              px-5
              py-4
              transition
              hover:border-[#6F8F72]
            "
          >
            <input
  type="radio"
  name="role"
  value="Student"
  checked={role === "Student"}
  onChange={(e) => setRole(e.target.value)}
  className="accent-[#6F8F72]"
/>

            <span className="text-[#2B2B2B]">Student</span>
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-[#DDE9D8]
              bg-white
              px-5
              py-4
              transition
              hover:border-[#6F8F72]
            "
          >
            <input
  type="radio"
  name="role"
  value="Parent / Guardian"
  checked={role === "Parent / Guardian"}
  onChange={(e) => setRole(e.target.value)}
  className="accent-[#6F8F72]"
/>

            <span className="text-[#2B2B2B]">
              Parent / Guardian
            </span>
          </label>
        </div>
      </div>

      {/* Country */}

<div className="mt-10">
  <label
    className="
      block
      text-lg
      font-medium
      text-[#2B2B2B]
    "
  >
    Country / Region
  </label>

  <input
    type="text"
    placeholder="Optional"
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    className="
      mt-4
      w-full
      rounded-xl
      border
      border-[#DDE9D8]
      bg-white
      px-5
      py-3
      outline-none
      transition
      focus:border-[#6F8F72]
    "
  />
</div>

      {/* Reflection */}

<div className="mt-10">
  <label
    className="
      block
      text-lg
      font-medium
      text-[#2B2B2B]
    "
  >
    Share your reflection{" "}
    <span className="text-red-500">*</span>
  </label>

  <textarea
    rows={8}
    placeholder="Share anything you'd like about your learning journey. You can talk about your progress, your favorite part of the lessons, or something you're now able to do that you couldn't do before."
    value={reflection}
    onChange={(e) => setReflection(e.target.value)}
    className="
      mt-4
      w-full
      rounded-xl
      border
      border-[#DDE9D8]
      bg-white
      px-5
      py-4
      leading-7
      outline-none
      transition
      focus:border-[#6F8F72]
    "
  />
</div>

      {/* Upload Photo */}

      <div className="mt-10">
        <label
  className="
    block
    text-lg
    font-medium
    text-[#2B2B2B]
  "
>
  Photo (Optional)
</label>

<p
  className="
    mt-2
    text-sm
    leading-6
    text-[#6B6B6B]
  "
>
  If you'd like your photo to appear with your reflection, you can upload one here.
</p>

        <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setPhoto(e.target.files ? e.target.files[0] : null)
  }
  className="
    mt-5
    block
    w-full
    rounded-xl
    border
    border-[#DDE9D8]
    bg-white
    p-4
    file:mr-4
    file:rounded-full
    file:border-0
    file:bg-[#6F8F72]
    file:px-4
    file:py-2
    file:text-white
    file:cursor-pointer
    hover:file:bg-[#5B7960]
  "
/>
      </div>

      {/* Permission */}

<div className="mt-10">
  <label
    className="
      flex
      items-start
      gap-3
      text-[#5B5B5B]
      leading-7
    "
  >
    <input
      type="checkbox"
      className="
        mt-1
        h-5
        w-5
        accent-[#6F8F72]
      "
    />

    <span>
      I give <strong>Hamkke</strong> permission to publish my reflection
      and uploaded photo (if provided) on the website.
    </span>
  </label>
</div>

      {/* Submit */}

      <button
  type="button"
  onClick={handleSubmit}
  disabled={loading}
        className="
          mt-12
          w-full
          rounded-full
          bg-[#6F8F72]
          py-4
          text-lg
          font-medium
          text-white
          transition
          hover:bg-[#5B7960]
          disabled:opacity-50
disabled:cursor-not-allowed
        "
      >
        {loading ? "Sending..." : "Share My Reflection"}
      </button>
    </section>
  );
}