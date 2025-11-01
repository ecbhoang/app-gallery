/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type FormEvent } from "react";
import clsx from "clsx";
import type { LaunchpadController } from "@hooks/useLaunchpadState";
import { DEFAULT_ICON } from "@lib/constants";
import CloseIcon from "@icons/CloseIcon";
import { Modal } from "@components/launchpad/Modal";

type AddAppModalProps = {
  controller: LaunchpadController;
};

export function AddAppModal({ controller }: AddAppModalProps) {
  const [formState, setFormState] = useState({
    name: "",
    url: "",
    description: "",
    tags: "",
    iconChoice: controller.iconLibrary[0] ?? DEFAULT_ICON,
    iconCustom: "",
  });
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    if (!controller.modals.addApp) return;
    const editing = controller.editingApp;
    if (editing && editing.origin === "custom") {
      setFormState({
        name: editing.name,
        url: editing.url ?? "",
        description: editing.description ?? "",
        tags: Array.isArray(editing.tags) ? editing.tags.join(", ") : "",
        iconChoice: controller.iconLibrary.includes(editing.icon)
          ? editing.icon
          : "custom",
        iconCustom: controller.iconLibrary.includes(editing.icon)
          ? ""
          : editing.icon,
      });
    } else {
      setFormState({
        name: "",
        url: "",
        description: "",
        tags: "",
        iconChoice: controller.iconLibrary[0] ?? DEFAULT_ICON,
        iconCustom: "",
      });
    }
    setFeedback("");
  }, [controller.modals.addApp, controller.editingApp, controller.iconLibrary]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = controller.submitCustomApp({
      id:
        controller.editingApp?.origin === "custom"
          ? controller.editingApp.id
          : undefined,
      name: formState.name,
      url: formState.url,
      description: formState.description,
      tagsInput: formState.tags,
      iconChoice: formState.iconChoice,
      iconCustom: formState.iconCustom,
    });
    if (!result.success) {
      setFeedback(result.message ?? "Unable to save the app.");
    } else {
      setFeedback(result.message ?? "App saved successfully.");
    }
  };

  return (
    <Modal
      open={controller.modals.addApp}
      onClose={() => controller.closeAddApp()}
      ariaLabel="Add application"
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {controller.editingApp
                ? `Edit “${controller.editingApp.name}”`
                : "Add application"}
            </h2>
            <p className="text-xs text-slate-400">
              Create shortcuts for the tools you use frequently.
            </p>
          </div>
          <button
            type="button"
            onClick={() => controller.closeAddApp()}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6 sm:px-8">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Name
            </span>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none focus:ring-0"
              placeholder="Toolbox"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              URL
            </span>
            <input
              type="url"
              required
              value={formState.url}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, url: event.target.value }))
              }
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none focus:ring-0"
              placeholder="https://example.com"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Short description
            </span>
            <textarea
              rows={2}
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none focus:ring-0"
              placeholder="Optional"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Tags
            </span>
            <input
              type="text"
              value={formState.tags}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, tags: event.target.value }))
              }
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none focus:ring-0"
              placeholder="productivity, ai"
            />
          </label>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              App icon
            </span>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {controller.iconLibrary.map((icon) => (
                <label
                  key={icon}
                  className={clsx(
                    "group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/10",
                    formState.iconChoice === icon && "border-sky-400/60"
                  )}
                >
                  <input
                    type="radio"
                    name="iconChoice"
                    value={icon}
                    checked={formState.iconChoice === icon}
                    onChange={() =>
                      setFormState((prev) => ({
                        ...prev,
                        iconChoice: icon,
                        iconCustom: "",
                      }))
                    }
                    className="peer sr-only text-base"
                  />
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                    <img src={icon} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Preset
                  </span>
                </label>
              ))}
              <label
                className={clsx(
                  "group flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 p-3 text-sm text-slate-200 transition hover:border-white/40 hover:bg-slate-900/60",
                  formState.iconChoice === "custom" && "border-sky-400/60"
                )}
              >
                <input
                  type="radio"
                  name="iconChoice"
                  value="custom"
                  checked={formState.iconChoice === "custom"}
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, iconChoice: "custom" }))
                  }
                  className="sr-only text-base"
                />
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Custom icon URL
                </span>
                <input
                  type="url"
                  value={formState.iconCustom}
                  onFocus={() =>
                    setFormState((prev) => ({ ...prev, iconChoice: "custom" }))
                  }
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      iconCustom: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400/40 focus:outline-none focus:ring-0"
                  placeholder="https://example.com/icon.png"
                />
              </label>
            </div>
          </div>

          {feedback && <p className="text-xs text-emerald-400">{feedback}</p>}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/80 px-6 py-4 text-sm text-slate-300 sm:px-8">
          <button
            type="button"
            onClick={() => controller.closeAddApp()}
            className="rounded-2xl border border-white/10 bg-transparent px-5 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-2xl bg-sky-500/80 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
          >
            {controller.editingApp ? "Save changes" : "Add app"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
