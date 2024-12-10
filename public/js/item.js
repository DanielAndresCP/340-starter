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
            console.log(error);

            evt.target
                .closest("div")
                .append("There was an error deleting the comment");
        }
    });
});
