var contrastOverlayActive = false;
var btnContrast = document.getElementById("btn-contrast");
var contrastOverlay = document.getElementById("contrast-overlay");
var photoContainer = document.getElementById("photo-container");

btnContrast.addEventListener("click", function () {
    if (!contrastOverlayActive) {
        showcontrastOverlay();
    } else {
        hidecontrastOverlay();
    }
})

function hidecontrastOverlay(){
    contrastOverlay.classList.remove("opacity-100","animate-fade-in"); 
    contrastOverlay.classList.add("animate-fade-out", "opacity-0");    
    setTimeout(function(){
        contrastOverlay.classList.add("hidden");
        photoContainer.classList.remove("z-50");
    }, 500);
    contrastOverlayActive = false;
}

function showcontrastOverlay(){
    contrastOverlay.classList.remove("hidden","opacity-0","animate-fade-out");
    contrastOverlay.classList.add("animate-fade-in","opacity-100");
    photoContainer.classList.add("z-50");
    contrastOverlayActive = true; 
}

// hide opacity overlay when clicked outside of it
document.addEventListener("click", function (event){
    if(!btnContrast.contains(event.target) && contrastOverlayActive){
        hidecontrastOverlay();
    }
})

// Show/hide gray background when image not loaded
window.addEventListener("load", () => {
    var image = document.getElementById('photo');
    var imageWrapper = document.getElementById('photo-wrapper');
    var load = image.complete;
    if (load){
        imageWrapper.classList.remove("animate-pulse","bg-gray-300", "h-500")
        image.classList.remove("hidden")
        image.classList.add("animate-fade-in")
    }
});

function downloadImage(width, height, hash, filebase) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/ajax/download', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (!response.error) {
                downloadBlobFromUrl(response.data.url, filebase);
            }
        } else {
            textButton.classList.remove("hidden");
            spinButton.classList.add("hidden");
            document.getElementById("btn-download").setAttribute('disabled','disabled')
        }
    };
    xhr.send(JSON.stringify({
        width: width,
        height: height,
        hash: hash
    }));
}

function downloadFullImage(id, filebase) {
    var textButton = document.getElementById("btn-text-download");
    var spinButton = document.getElementById("btn-spin-download");

    textButton.classList.add("hidden");
    spinButton.classList.remove("hidden");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/ajax/download', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (!response.error) {
                downloadBlobFromUrl(response.data.url, filebase);
            }
        } else {
            textButton.classList.remove("hidden");
            spinButton.classList.add("hidden");
            document.getElementById("btn-download").setAttribute('disabled','disabled')
        }
    };
    xhr.send(JSON.stringify({
        id: id
    }));
}

function downloadBlobFromUrl(url, filename){
    var textButton = document.getElementById("btn-text-download");
    var spinButton = document.getElementById("btn-spin-download");

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (xhr.status === 200) {
            var blob = xhr.response;
            var url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            spinButton.classList.add("hidden");
            textButton.classList.remove("hidden");
        } else {
            textButton.classList.remove("hidden");
            spinButton.classList.add("hidden");
            document.getElementById("btn-download").setAttribute('disabled','disabled')
        }
    };
    xhr.send();
}