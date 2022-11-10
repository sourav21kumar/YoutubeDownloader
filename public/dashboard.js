window.addEventListener("DOMContentLoaded", async (event) => {
  const navbar = document.querySelector(".navbar");
  navbar.style.marginBottom = "25px";
  const dashOption = document.getElementById("ud");
  dashOption.style.zIndex = "1";

  try {
    const dashboardResult = await fetch("/application/Dashboard/videodetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const recievedData = await dashboardResult.json();
    console.log(recievedData);
    if (recievedData.message) {
      let heading = document.querySelector('.message')
      heading.innerText = recievedData.message
      heading.style.display = 'block'
      heading.style.visibility = 'visible'
    }
    else {
      // We will loop the response and render the dashboard page with the user's data
      // This is the main container where the items will be rendered
      let headingMessage = document.querySelector('.message')
      headingMessage.style.display = 'none'
      headingMessage.style.visibility = 'hidden'
      recievedData.downloadList.reverse(); // Render according to the latest video downloaded
      getItemDiv(recievedData.downloadList); // this will render the DOM Content according to the response from the server

    }
  } catch (error) {
    console.log(error);
  }
});

{
  /* <div class="items">
        <div class="embed-link">
            <iframe class="iframa" src="https://www.youtube.com/embed/HHZ5FzIam3c" frameborder="0"></iframe>
        </div>
        <div class="yt-video-title">
            <span id="title">Full video: Nain Ta Heere - JugJugg Jeeyo | Varun, Kiara | Vishal S |
                Guru R, Asees K | Bhushan K
            </span>
        </div>
    </div> */
}

function getItemDiv(downloadList) {
  let videoItemsContainer = document.querySelector(".video-items-container");
  downloadList.forEach((element) => {
    // console.log(element)
    //Item Div
    let divItem = document.createElement("div");
    divItem.classList.add("items");
    // EmbedLink Div
    let divEmbedLink = document.createElement("div");
    divEmbedLink.classList.add("embed-link");
    // iframe
    let iframe = document.createElement("iframe");
    iframe.classList.add("iframe");
    iframe.src = `${element.embedURL}`;
    // Iframe appended to the embed-link Div
    divEmbedLink.append(iframe);
    // yt-video-list div created
    let divYTVideoList = document.createElement("div");
    divYTVideoList.classList.add("yt-video-title");

    let divTitle = document.createElement("div");
    divTitle.classList.add("meta");
    let spanTitle1 = document.createElement("span");
    spanTitle1.innerText = "TITLE: ";
    // spanTitle1.style.float = 'left'
    spanTitle1.classList.add("span-placeholder");
    let spanTitle2 = document.createElement("span");
    spanTitle2.innerText = `${element.title}`;
    spanTitle2.classList.add("span-meta");
    divTitle.append(spanTitle1);
    divTitle.append(spanTitle2);

    let divQuality = document.createElement("div");
    divQuality.classList.add("meta");
    let spanQuality1 = document.createElement("span");
    spanQuality1.innerText = "QUALITY: ";
    // spanQuality1.style.float = 'left'
    spanQuality1.classList.add("span-placeholder");
    let spanQuality2 = document.createElement("span");
    spanQuality2.innerHTML = `${element.quality}`;
    spanQuality2.classList.add("span-meta");
    divQuality.append(spanQuality1);
    divQuality.append(spanQuality2);

    divYTVideoList.append(divTitle);
    divYTVideoList.append(divQuality);

    // embed-link div appended to item div
    divItem.append(divEmbedLink);
    // yt-video-list div appended to div item
    divItem.append(divYTVideoList);
    // Item div is appended to videoItemsContainer
    videoItemsContainer.append(divItem);
  });
}
