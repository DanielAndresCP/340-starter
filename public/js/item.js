// Delete comment functionality

async function deleteComment(comment_id) {
    const response = await fetch("/comments/delete-comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment_id }),
    });

    const data = await response.json();

    if (data.hasErrors) {
        throw new Error(data.errors[0]);
    }
    return data;
}

[...document.querySelectorAll("button.delete-comment-button")].forEach((x) => {
    x.addEventListener("click", async (evt) => {
        const comment_id = evt.target.closest("div").dataset.commentId;

        try {
            const result = await deleteComment(comment_id);

            evt.target.closest("article.comment").textContent = result.msg;
        } catch (error) {
            evt.target
                .closest("div")
                .append("There was an error deleting the comment");
        }
    });
});

// Edit comment functionality
function generateEditCommentForm({ comment_id, comment_text, inv_id }) {
    // <section>
    //     <h1>Edit comment</h1>
    //     <form action="/comments/edit-comment" method="post">
    //         <label>
    //             Edit Comment:
    //             <textarea name="comment_text" required>
    //                 Previous text
    //             </textarea>
    //         </label>
    //         <input type="hidden" name="inv_id" value="INV ID VALUE" />
    //         <input type="hidden" name="comment_id" value="COMMENT ID VALUE" />

    //         <button type="submit">Edit Comment</button>
    //     </form>
    // </section>;

    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = "Edit comment";
    section.append(title);

    const form = document.createElement("form");
    form.action = "/comments/edit-comment";
    form.method = "post";
    section.append(form);

    const comment_text_label = document.createElement("label");
    comment_text_label.append("Comment:");
    form.append(comment_text_label);

    const comment_text_textarea = document.createElement("textarea");
    comment_text_textarea.name = "comment_text";
    comment_text_textarea.required = true;
    comment_text_textarea.value = comment_text;
    comment_text_label.append(comment_text_textarea);

    const inv_id_input = document.createElement("input");
    inv_id_input.type = "hidden";
    inv_id_input.name = "inv_id";
    inv_id_input.value = inv_id;
    form.append(inv_id_input);

    const comment_id_input = document.createElement("input");
    comment_id_input.type = "hidden";
    comment_id_input.name = "comment_id";
    comment_id_input.value = comment_id;
    form.append(comment_id_input);

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Edit Comment";
    form.append(submitBtn);

    return section;
}

[...document.querySelectorAll("button.edit-comment-button")].forEach((x) => {
    x.addEventListener("click", (evt) => {
        const btnContainer = evt.target.closest("div");
        const articleEl = evt.target.closest("article");

        const comment_id = btnContainer.dataset.commentId;
        const inv_id = btnContainer.dataset.invId;
        const comment_text = articleEl.querySelector(
            "div:first-child p:last-child"
        ).textContent;

        articleEl.innerHTML = "";

        const form = generateEditCommentForm({
            comment_id,
            comment_text,
            inv_id,
        });
        articleEl.append(form);
    });
});
