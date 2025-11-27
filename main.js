// 语言切换
const langButtons = document.querySelectorAll(".lang-switch button");
const body = document.body;

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang; // "zh" or "en"
    body.classList.toggle("lang-zh", lang === "zh");
    body.classList.toggle("lang-en", lang === "en");

    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// 表单提交（使用 Formspree，无需后端）
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "";

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        if (body.classList.contains("lang-zh")) {
          statusEl.textContent = "提交成功，我们会尽快与您联系。";
        } else {
          statusEl.textContent = "Thank you! We will get back to you soon.";
        }
        form.reset();
      } else {
        if (body.classList.contains("lang-zh")) {
          statusEl.textContent = "提交失败，请稍后重试或直接发送邮件给我们。";
        } else {
          statusEl.textContent = "Submission failed. Please try again or email us directly.";
        }
      }
    } catch (error) {
      if (body.classList.contains("lang-zh")) {
        statusEl.textContent = "网络异常，请稍后重试。";
      } else {
        statusEl.textContent = "Network error. Please try again later.";
      }
    }
  });
}
