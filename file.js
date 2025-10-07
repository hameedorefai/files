async function getParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


function getFileExtension(url) {
    const path = url.split('?')[0];
    const extension = path.split('.').pop();
    return extension;
}

async function getFileData() {
    const courseId = await getParam('id') || null;
    if (courseId) {
        try {
            const response = await fetch('https://zmyl.azurewebsites.net/api/files/' + courseId);

            if (!response.ok) {
                // محاولة قراءة نص الرسالة من الخادم
                const errorMessage = await response.text();
                setAlert('alert', errorMessage || 'لم يتم العثور على هذا الملف');
                return;
            }

            const file = await response.json();
            setDataFile(file);
            return;
        } catch (error) {
            setAlert('error', `حدث خطأ في عرض البيانات: ${error.message}`);
            throw new Error(error);
        }
    } else {
        window.location.href = "/courses/course-search.html";
    }
}

function setAlert(type, text) {
    const alerts = document.querySelector('.alerts');
    let alertsEl = '';

    if (type === 'error') {
        alertsEl = `<div class="alert alert-danger d-flex align-items-center" role="alert">
                    <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${text}
                    </div>
                  </div>`;
    } else if (type === 'alert') {
        alertsEl = `<div class="alert alert-warning d-flex align-items-center" role="alert">
                    <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                    ${text}
                    </div>
             </div>`;
    } else {
        alertsEl = `<div class="alert alert-primary d-flex align-items-center" role="alert">
                    <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                    <div>
                       ${text}
                    </div>
             </div>`
    }
    alerts.innerHTML = alertsEl;
}



function getDateTime(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    if (year < 2000) {
        return null;
    }
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    //const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');
    const formattedTime = `${formattedHours}:${minutes} ${period}`;
    return formattedTime;
}

function getDate(dateString) {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    if (year < 2000) {
        return null;
    }
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}




function newTr(text, val) {
    return `<tr><td>${text}</td><td>${val}</td>`;
}
function newTrHeader(text) {
    return `<tr><th colspan="2" scope="row" class="bg-success bg-gradient text-center text-light">${text}</th></tr>`;
}


function bytesToMegabytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}


  function setDataFile(data) {
    // Ensure DOM is ready before manipulating elements
    function runSetDataFile() {
        // Fallback for legacy code that expects .file-table .title-page
        if (!document.querySelector('.file-table .title-page')) {
            var fallbackElement = document.createElement('div');
            fallbackElement.className = 'file-table';
            var titlePage = document.createElement('div');
            titlePage.className = 'title-page';
            fallbackElement.appendChild(titlePage);
            document.body.appendChild(fallbackElement);
            fallbackElement.style.display = 'none'; // Hide the fallback
        }
        // ...existing code...
        let fileName = data.fileName || 'ملف بلا اسم';
        if(fileName){
            fileName = fileName.replace(/_|-/g,' ')
        }
        // ...rest of setDataFile logic...
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { runSetDataFile(); });
    } else {
        runSetDataFile();
    }
    let fileName = data.fileName || 'ملف بلا اسم';
    if(fileName){
        fileName = fileName.replace(/_|-/g,' ')
    }

    // File size formatting
    const fileSize = data.fileSize ? `${bytesToMegabytes(data.fileSize)}MB` : '';
    
    // Build download/preview buttons
    let fileActionsHTML = '<div class="download-preview-grid">';
    
    // Preview button for PDF (70% width)
    const fileExtension = getFileExtension(data.fileLink);
    if(fileExtension?.toLowerCase() == 'pdf'){
        fileActionsHTML += `
            <button type="button" class="file-action-btn preview-btn" onclick="openPDFModal('${data.fileLink}')" style="border: none;">
                <i class="fas fa-file-pdf icon"></i>
                <span>مشاهدة الملف</span>
            </button>`;
    }
    
    // Download button (30% width)
    fileActionsHTML += `
        <a href="${data.fileLink}" class="file-action-btn download-btn" role="button">
            <i class="fas fa-download icon"></i>
            <span>تنزيل</span>
            ${fileSize ? `<span class="size">${fileSize}</span>` : ''}
        </a>`;
    
    fileActionsHTML += '</div>';

    // Update page title and content
        document.title = fileName + ' - موقع زمايل';
        var fileTitleEl = document.querySelector('.file-title');
        if (fileTitleEl) fileTitleEl.innerHTML = fileName;
        var fileDownloadPreviewEl = document.querySelector('.file-download-preview');
        if (fileDownloadPreviewEl) fileDownloadPreviewEl.innerHTML = fileActionsHTML;
    
    // Update stats
        var viewCountEl = document.querySelector('#viewCount');
        if (viewCountEl) viewCountEl.textContent = data.downloadCount + 1;
    // Initialize vote counts and button state via setDataVote to ensure API logic and localStorage state are applied
    try {
        setDataVote(data.upVotes || 0, data.downVotes || 0, data.id || data.fileId || 0);
    } catch (err) {
        console.error('Error initializing vote data:', err);
        // Fallback: set counts directly if setDataVote fails
        const upEl = document.querySelector('#upVoteCount .counts');
        const downEl = document.querySelector('#downVoteCount .counts');
        if (upEl) upEl.textContent = data.upVotes || 0;
        if (downEl) downEl.textContent = data.downVotes || 0;
    }
    
    // Update creator info
    if (data.userCreator) {
        const creatorInfo = document.querySelector('.creator-info');
        const creatorLink = document.querySelector('#creatorLink');
        const creatorAvatar = document.querySelector('#creatorAvatar');
        const creatorName = document.querySelector('#creatorName');
        
    if (creatorInfo && creatorLink && creatorAvatar && creatorName) {
            const profilePictureUrl = data.userCreator.profilePictureUrl;
            const fullName = data.userCreator.fullName || data.userCreator.userName;
            
            // Set name and alt text
            creatorName.textContent = fullName || 'مستخدم مجهول';
            creatorAvatar.alt = `صورة ${fullName || 'مستخدم مجهول'}`;
            
            // Set image source - only if not null/undefined/empty
            if (profilePictureUrl && profilePictureUrl !== 'null' && profilePictureUrl.trim() !== '') {
                // Load image asynchronously after page load to improve performance
                const img = new Image();
                
                // Add size optimization parameters if possible
                let optimizedUrl = profilePictureUrl;
                
                // For common image services, add size parameters
                if (profilePictureUrl.includes('googleusercontent.com')) {
                    optimizedUrl = profilePictureUrl + '=s40-c'; // Google images: 40px size, cropped
                } else if (profilePictureUrl.includes('amazonaws.com') || profilePictureUrl.includes('s3')) {
                    // For AWS S3, we could add query parameters if the service supports it
                    optimizedUrl = profilePictureUrl + '?w=40&h=40&fit=crop';
                } else if (profilePictureUrl.includes('cloudinary.com')) {
                    optimizedUrl = profilePictureUrl.replace('/upload/', '/upload/w_40,h_40,c_fill/');
                } else {
                    // For other services, try common optimization parameters
                    const separator = profilePictureUrl.includes('?') ? '&' : '?';
                    optimizedUrl = profilePictureUrl + separator + 'w=40&h=40&q=80';
                }
                
                img.onload = function() {
                    creatorAvatar.src = optimizedUrl;
                };
                
                img.onerror = function() {
                    // If optimized fails, try original
                    const originalImg = new Image();
                    originalImg.onload = function() {
                        creatorAvatar.src = profilePictureUrl;
                    };
                    originalImg.onerror = function() {
                        // Keep default image if both fail
                    };
                    originalImg.src = profilePictureUrl;
                };
                
                // Start loading the image
                img.src = optimizedUrl;
            }
            
            // Build profile URL (prefer userId for reliability)
            const userName = data.userCreator.userName;
            const userId = data.userCreator.userId;
            let profileUrl = '#';
            if (userId && userId !== 'null') {
                profileUrl = `/profile.html?id=${userId}`;
            } else if (userName && String(userName).trim() !== '') {
                profileUrl = `/profile.html?u=${encodeURIComponent(userName)}`;
            }
            creatorLink.href = profileUrl;
            // Click on avatar also navigates to profile
            creatorAvatar.style.cursor = 'pointer';
            creatorAvatar.addEventListener('click', () => {
                if (profileUrl && profileUrl !== '#') window.location.href = profileUrl;
            });

            // LinkedIn-style subtitle (bio/specialization/about)
            const creatorSubtitleEl = document.querySelector('#creatorSubtitle');
            if (creatorSubtitleEl) {
                // Try common fields in priority order
                const uc = data.userCreator || {};
                const subtitle =
                    (typeof uc.bio === 'string' && uc.bio.trim()) ||
                    (typeof uc.specialization === 'string' && uc.specialization.trim()) ||
                    (typeof uc.major === 'string' && uc.major.trim()) ||
                    (typeof uc.headline === 'string' && uc.headline.trim()) ||
                    (typeof uc.about === 'string' && uc.about.trim()) || '';

                // Prefer real data from API: title -> bio -> specialization -> major -> headline -> about
                // If no value, hide the subtitle element
                const apiTitle = (typeof uc.title === 'string' && uc.title.trim()) || '';
                const finalSubtitle = apiTitle || subtitle || '';

                if (finalSubtitle) {
                    creatorSubtitleEl.textContent = finalSubtitle;
                    creatorSubtitleEl.style.display = 'block';
                } else {
                    creatorSubtitleEl.textContent = '';
                    creatorSubtitleEl.style.display = 'none';
                }
            }
            
            // Show creator info
            creatorInfo.style.display = 'block';
        }
    }
    
    // Update file description: show the block only when description is present
    try {
        const descWrapper = document.querySelector('.file-description');
        const descSpan = document.querySelector('.file-desc');
        if (descWrapper && descSpan) {
            if (data.description && String(data.description).trim() !== '') {
                // set as plain text to avoid accidental HTML injection
                descSpan.textContent = data.description;
                descWrapper.style.display = 'block';
            } else {
                // hide when no description
                descSpan.textContent = '';
                descWrapper.style.display = 'none';
            }
        }
    } catch (e) {
        // fallback: ensure the element is hidden if any issue
        const descWrapper = document.querySelector('.file-description');
        if (descWrapper) descWrapper.style.display = 'none';
    }
    
    // Update file meta for creator section
    //document.querySelector('#fileMeta').textContent = `تم رفعه في ${new Date().toLocaleDateString('ar-EG')}`;
    
    // Build action buttons with new design
    let buttonsHTML = '';
    
    // Preview button for PDF (70% width)
    const fileExt = getFileExtension(data.fileLink);
    if(fileExt?.toLowerCase() == 'pdf'){
        buttonsHTML += `
            <button type="button" class="btn-primary" onclick="openPDFModal('${data.fileLink}')" style="border: none;">
                <i class="fas fa-file-pdf"></i>
                <span>عرض الملف</span>
            </button>`;
    }
    
    // Download button (30% width)
    buttonsHTML += `
        <a href="${data.fileLink}" class="btn-secondary" role="button">
            <i class="fas fa-download"></i>
            <span>تنزيل</span>
            ${fileSize ? `<span class="size">${fileSize}</span>` : ''}
        </a>`;
    
    document.querySelector('.file-download-preview').innerHTML = buttonsHTML;
    
    // Set the data attribute for the favorite button
    document.querySelector('#addToFavoritesBtn').setAttribute('data-file-id', data.fileId);
    
    // Update file name in modal
    const currentFileNameElement = document.getElementById('currentFileName');
    if (currentFileNameElement) {
        currentFileNameElement.textContent = fileName;
    }
    
    // Show content with animation
    document.querySelector('.alerts').classList.add('d-none');
    const fileContent = document.querySelector('.file-content');
    fileContent.classList.remove('d-none');
    
    // Trigger animation after a small delay
    setTimeout(() => {
        fileContent.classList.add('show');
    }, 100);
    
    // Bind events and set vote data
    bindFileNoteEvents();
    setDataVote(data.upVotes, data.downVotes, data.fileId);
}






let pdfloaded = false;

function loadPDF(pdfPath) {
    if(!pdfloaded){
        var theme = getCookie('theme') || 'light';
    
    document.getElementById('errorMessage').classList.add('d-none');
    const loadingMessage = document.getElementById('loadingMessage');
    const pdfViewer = document.getElementById('pdfViewer')
    loadingMessage.classList.remove('d-none');
    const viewerElement = document.getElementById('pdfViewer');

    try {
    WebViewer({
        path: '/assets/PDFJSExpress/lib',
        licenseKey: 'cJUUD5HN87VzAzQseQDs',
        initialDoc: pdfPath,
    }, viewerElement)
    .then(instance => {
        instance.UI.setTheme(theme);
            loadingMessage.classList.add('d-none');
            pdfViewer.classList.remove('d-none');
            pdfloaded = true;
   
    });
 } catch (ex) {
    loadingMessage.classList.add('d-none');
    console.error('Error loading PDF:', ex);
    document.getElementById('errorMessage').classList.remove('d-none');
}
    
         





/*
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    loadingTask.promise.then(pdf => {
        loadingMessage.classList.add('d-none');

        const numPages = pdf.numPages;
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            pdf.getPage(pageNum).then(page => {
                const viewport = page.getViewport({ scale: 1 });
                const scale = (window.innerWidth - 32) / viewport.width;
                const scaledViewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                const pixelRatio = (window.devicePixelRatio || 1) * 2;
                canvas.width = scaledViewport.width * pixelRatio;
                canvas.height = scaledViewport.height * pixelRatio;

                canvas.style.width = `${scaledViewport.width}px`;
                canvas.style.height = `${scaledViewport.height}px`;

                context.scale(pixelRatio, pixelRatio);

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                page.render(renderContext);
                document.getElementById('pdfViewer').appendChild(canvas);
                pdfloaded = true;
            });
        }
    }).catch(error => {
        loadingMessage.classList.add('d-none');
        console.error('Error loading PDF:', error);
        document.getElementById('errorMessage').classList.remove('d-none');
    });
*/


}
}







function setDataVote(upVotes, downVotes, fileId) {
    const upBtnEl = document.querySelector('#upVoteBtn');
    const downBtnEl = document.querySelector('#downVoteBtn');
    if (upBtnEl) upBtnEl.dataset.file = fileId;
    if (downBtnEl) downBtnEl.dataset.file = fileId;
    const storedVotes = JSON.parse(localStorage.getItem('votes') || '{}');
    const voteType = storedVotes[fileId];

    // Update vote counts
    const upCountEl = document.querySelector('#upVoteCount .counts');
    const downCountEl = document.querySelector('#downVoteCount .counts');
    if (upCountEl) upCountEl.textContent = upVotes;
    if (downCountEl) downCountEl.textContent = downVotes;

    // Also update compact small upvote count near the title if present
    const upSmall = document.getElementById('upVoteSmallCount');
    if (upSmall) upSmall.textContent = upVotes || 0;

    // Hide loading spinners
    const upVoteLoader = document.querySelector('#upVoteCount .loader-counts');
    const downVoteLoader = document.querySelector('#downVoteCount .loader-counts');
    if (upVoteLoader) upVoteLoader.classList.remove('show');
    if (downVoteLoader) downVoteLoader.classList.remove('show');

    const upVoteBtn = upBtnEl; // may be null
    const downVoteBtn = downBtnEl; // may be null
    const upVoteBtnIcon = upVoteBtn ? upVoteBtn.querySelector('i') : null;
    const downVoteBtnIcon = downVoteBtn ? downVoteBtn.querySelector('i') : null;

    // Reset button states safely (use upvoted/downvoted classes)
    if (upVoteBtn) {
        upVoteBtn.classList.remove('active');
        upVoteBtn.classList.remove('upvoted');
    }
    if (downVoteBtn) {
        downVoteBtn.classList.remove('active');
        downVoteBtn.classList.remove('downvoted');
    }
    if (upVoteBtnIcon && upVoteBtnIcon.classList) upVoteBtnIcon.classList.replace && upVoteBtnIcon.classList.replace('fas', 'fal');
    if (downVoteBtnIcon && downVoteBtnIcon.classList) downVoteBtnIcon.classList.replace && downVoteBtnIcon.classList.replace('fas', 'fal');
    // Ensure any inline color is cleared when resetting state so CSS classes control appearance
    if (upVoteBtnIcon) upVoteBtnIcon.style.color = '';
    if (downVoteBtnIcon) downVoteBtnIcon.style.color = '';

    // Set active state based on stored vote
    if (voteType === 'upVote' && upVoteBtn) {
        // Mark as upvoted (CSS will show red heart)
        upVoteBtn.classList.add('upvoted');
        if (upVoteBtnIcon) upVoteBtnIcon.classList.replace && upVoteBtnIcon.classList.replace('fal', 'fas');
        if (upVoteBtnIcon) upVoteBtnIcon.dataset.iconOld = 'fas';
        // Force the heart to the desired red immediately (fixes cases where font weight swap doesn't repaint fully)
        if (upVoteBtnIcon) upVoteBtnIcon.style.color = '#c82333';
    } else if (voteType === 'downVote' && downVoteBtn) {
        // Mark as downvoted
        downVoteBtn.classList.add('downvoted');
        if (downVoteBtnIcon) downVoteBtnIcon.classList.replace && downVoteBtnIcon.classList.replace('fal', 'fas');
        if (downVoteBtnIcon) downVoteBtnIcon.dataset.iconOld = 'fas';
        if (downVoteBtnIcon) downVoteBtnIcon.style.color = '';
    }
}

function btnDownVoteHover(button) {
    const icon = button.querySelector('i');
    let iconOld = icon.classList.contains('fas') ? 'fas' : 'fal';
    icon.setAttribute('data-icon-old', iconOld);
    icon.classList.remove('fal', 'fas');
    icon.classList.add('fad');
}

function btnDownVoteOut(button) {
    const icon = button.querySelector('i');
    const iconOld = icon.getAttribute('data-icon-old') || 'fal';
    icon.classList.remove('fas', 'fal', 'fad');
    icon.classList.add(iconOld);
}

async function toggleVote(button, voteType) {
    // التحقق من وجود التوكن
    const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
    
    if (!token) {
        showToast('يرجى تسجيل الدخول أولاً للتصويت', 'error');
        return;
    }

    const dataFile = button.getAttribute('data-file');
    const storedVotes = JSON.parse(localStorage.getItem('votes') || '{}');
    const existingVote = storedVotes[dataFile];
    const dataPost = {};

    if (existingVote === voteType) {
        delete storedVotes[dataFile];
        dataPost["deleted"] = voteType;
    } else {
        if(existingVote === 'upVote' || existingVote === 'downVote'){
            dataPost["deleted"] = existingVote;
        }
        storedVotes[dataFile] = voteType;
    }

    dataPost['fileId'] = dataFile;
    dataPost['vote'] = storedVotes[dataFile];

    localStorage.setItem('votes', JSON.stringify(storedVotes));

    const sendVotes = await sendVote(dataPost, token);
    // لا نعرض رسالة نجاح عند التصويت، حافظ على عرض الخطأ فقط إذا فشل الطلب
    if (!sendVotes) {
        setAlert('error', 'فشل التصويت');
    }
}


async function sendVote(dataPost, token) {
    const upVoteBtn = document.querySelector('#upVoteBtn');
    const downVoteBtn = document.querySelector('#downVoteBtn');
    
    // إظهار السبينرز
    const upVoteLoader = document.querySelector('#upVoteCount .loader-counts');
    const downVoteLoader = document.querySelector('#downVoteCount .loader-counts');
    if (upVoteLoader) upVoteLoader.classList.add('show');
    if (downVoteLoader) downVoteLoader.classList.add('show');
    
    // تعطيل الأزرار وإظهار حالة التحميل (محمي)
    if (upVoteBtn) upVoteBtn.disabled = true;
    if (downVoteBtn) downVoteBtn.disabled = true;

    const upVoteIcon = upVoteBtn ? upVoteBtn.querySelector('i') : null;
    const downVoteIcon = downVoteBtn ? downVoteBtn.querySelector('i') : null;
    const originalUpClass = upVoteIcon ? upVoteIcon.className : '';
    const originalDownClass = downVoteIcon ? downVoteIcon.className : '';

    // Helper to restore icon class while applying final vote state.
    const restoreIcon = (icon, originalClass, finalVoteIs, voteName) => {
        if (!icon) return;
        if (finalVoteIs) {
            // Ensure solid filled heart and strong red color for immediate feedback
            icon.className = 'fas fa-heart';
            icon.style.color = '#ef4444';
        } else {
            // Restore original if it included fa-heart, otherwise use light heart
            if (originalClass && originalClass.includes('fa-heart')) {
                icon.className = originalClass;
            } else {
                icon.className = 'fal fa-heart';
            }
            icon.style.color = '';
        }
    };

    if (upVoteIcon) upVoteIcon.className = 'fas fa-spinner fa-spin';
    if (downVoteIcon) downVoteIcon.className = 'fas fa-spinner fa-spin';

    try {
        let response;
        
        // حذف التصويت السابق إذا وُجد
        if (dataPost.deleted) {
            const deleteUrl = dataPost.deleted === 'upVote'
                ? `https://zmyl.azurewebsites.net/api/FileUpVote/${dataPost.fileId}/upvote`
                : `https://zmyl.azurewebsites.net/api/FileDownVote/${dataPost.fileId}/downvote`;

            response = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('انتهت صلاحية جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى');
                } else if (response.status === 403) {
                    throw new Error('غير مصرح لك بحذف هذا التصويت');
                } else if (response.status === 404) {
                    throw new Error('التصويت غير موجود');
                }
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`خطأ في حذف التصويت: ${response.status}`);
            }
        }
        
        // إضافة التصويت الجديد
        if (dataPost.vote) {
            const postUrl = dataPost.vote === 'upVote'
                ? `https://zmyl.azurewebsites.net/api/FileUpVote/${dataPost.fileId}/upvote`
                : `https://zmyl.azurewebsites.net/api/FileDownVote/${dataPost.fileId}/downvote`;

            response = await fetch(postUrl, {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('انتهت صلاحية جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى');
                } else if (response.status === 403) {
                    throw new Error('غير مصرح لك بالتصويت على هذا الملف');
                }
                console.error(`HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

            if (!response) {
            // تنظيف الواجهات قبل الإرجاع
            const upVoteLoaderEarly = document.querySelector('#upVoteCount .loader-counts');
            const downVoteLoaderEarly = document.querySelector('#downVoteCount .loader-counts');
            if (upVoteLoaderEarly) upVoteLoaderEarly.classList.remove('show');
            if (downVoteLoaderEarly) downVoteLoaderEarly.classList.remove('show');
            if (upVoteBtn) upVoteBtn.disabled = false;
            if (downVoteBtn) downVoteBtn.disabled = false;
                // restore icons but respect the final vote state (no final vote here)
                restoreIcon(upVoteIcon, originalUpClass, false, 'upVote');
                restoreIcon(downVoteIcon, originalDownClass, false, 'downVote');
            return false;
        }

let downvotes = 0;
let upvotes = 0;
        
        try {
            const response = await fetch(`https://zmyl.azurewebsites.net/api/FileDownVote/${dataPost.fileId}/downvotes/count`);
                if (!response.ok) {
                // تنظيف الواجهات قبل الإرجاع
                const upVoteLoaderEarly = document.querySelector('#upVoteCount .loader-counts');
                const downVoteLoaderEarly = document.querySelector('#downVoteCount .loader-counts');
                if (upVoteLoaderEarly) upVoteLoaderEarly.classList.remove('show');
                if (downVoteLoaderEarly) downVoteLoaderEarly.classList.remove('show');
                if (upVoteBtn) upVoteBtn.disabled = false;
                if (downVoteBtn) downVoteBtn.disabled = false;
                    restoreIcon(upVoteIcon, originalUpClass, false, 'upVote');
                    restoreIcon(downVoteIcon, originalDownClass, false, 'downVote');
                return true;
            }
            const responses = await response.json();;
            downvotes = responses;
        } catch (error) {
            throw new Error(error);
        }
        try {
            const response = await fetch(`https://zmyl.azurewebsites.net/api/FileUpVote/${dataPost.fileId}/upvotes/count`);
                if (!response.ok) {
                // تنظيف الواجهات قبل الإرجاع
                const upVoteLoaderEarly = document.querySelector('#upVoteCount .loader-counts');
                const downVoteLoaderEarly = document.querySelector('#downVoteCount .loader-counts');
                if (upVoteLoaderEarly) upVoteLoaderEarly.classList.remove('show');
                if (downVoteLoaderEarly) downVoteLoaderEarly.classList.remove('show');
                if (upVoteBtn) upVoteBtn.disabled = false;
                if (downVoteBtn) downVoteBtn.disabled = false;
                    restoreIcon(upVoteIcon, originalUpClass, false, 'upVote');
                    restoreIcon(downVoteIcon, originalDownClass, false, 'downVote');
                return true;
            }
            const responses = await response.json();;
            upvotes = responses;



        } catch (error) {
            console.error(`Error in UpVote or DownVote buttons ${error}`);

            // إخفاء السبينرز
            const upVoteLoader = document.querySelector('#upVoteCount .loader-counts');
            const downVoteLoader = document.querySelector('#downVoteCount .loader-counts');
            if (upVoteLoader) upVoteLoader.classList.remove('show');
            if (downVoteLoader) downVoteLoader.classList.remove('show');

            // إعادة تعيين الأيقونات والأزرار إلى الحالة الأصلية
            if (upVoteBtn) upVoteBtn.disabled = false;
            if (downVoteBtn) downVoteBtn.disabled = false;
            if (upVoteIcon) upVoteIcon.className = originalUpClass;
            if (downVoteIcon) downVoteIcon.className = originalDownClass;
            throw new Error(error);
        }

        // إخفاء السبينرز عند النجاح
        const upVoteLoader = document.querySelector('#upVoteCount .loader-counts');
        const downVoteLoader = document.querySelector('#downVoteCount .loader-counts');
        if (upVoteLoader) upVoteLoader.classList.remove('show');
        if (downVoteLoader) downVoteLoader.classList.remove('show');

    // إعادة تعيين الأيقونات والأزرار عند النجاح
    if (upVoteBtn) upVoteBtn.disabled = false;
    if (downVoteBtn) downVoteBtn.disabled = false;
    // Use restore helper to set solid heart if final vote is upVote
    restoreIcon(upVoteIcon, originalUpClass, dataPost.vote === 'upVote', 'upVote');
    restoreIcon(downVoteIcon, originalDownClass, dataPost.vote === 'downVote', 'downVote');
        setDataVote(upvotes, downvotes, dataPost.fileId)

        return true;
    } catch (error) {
        // إخفاء السبينرز عند الفشل
        const upVoteLoader = document.querySelector('#upVoteCount .loader-counts');
        const downVoteLoader = document.querySelector('#downVoteCount .loader-counts');
        if (upVoteLoader) upVoteLoader.classList.remove('show');
        if (downVoteLoader) downVoteLoader.classList.remove('show');

    // إعادة تعيين الأيقونات والأزرار عند الفشل
    if (upVoteBtn) upVoteBtn.disabled = false;
    if (downVoteBtn) downVoteBtn.disabled = false;
    if (upVoteIcon) upVoteIcon.className = originalUpClass;
    if (downVoteIcon) downVoteIcon.className = originalDownClass;
    console.error("Request failed:", error);
        
        // إظهار رسالة خطأ مناسبة للمستخدم
        if (error.message.includes('انتهت صلاحية')) {
            showToast('انتهت صلاحية جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى', 'error');
        } else if (error.message.includes('غير مصرح')) {
            showToast('غير مصرح لك بالتصويت على هذا الملف', 'error');
        } else if (error.message.includes('التصويت غير موجود')) {
            showToast('التصويت غير موجود أو تم حذفه مسبقاً', 'warning');
        } else if (error.message.includes('خطأ في حذف التصويت')) {
            showToast('حدث خطأ في حذف التصويت، يرجى المحاولة مرة أخرى', 'error');
        } else {
            showToast('حدث خطأ في التصويت، يرجى المحاولة مرة أخرى', 'error');
        }
        
        return false;
    }
}



function openPDFModal(pdfPath) {
    loadPDF(pdfPath)
    const PDFModal = new bootstrap.Modal(document.getElementById('pdfModal'));
    PDFModal.show();
}

// دالة إضافة الملف إلى المفضلة
async function addToFavorites() {
    const btn = document.querySelector('#addToFavoritesBtn');
    const spinner = document.querySelector('#favoriteSpinner');
    const fileId = btn.getAttribute('data-file-id');
    
    if (!fileId) {
        showToast('خطأ: لم يتم العثور على معرف الملف', 'error');
        return;
    }
    
    // التحقق من وجود التوكن
    const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
    
    if (!token) {
        showToast('يجب تسجيل الدخول أولاً لإضافة الملف إلى المفضلة', 'error');
        return;
    }
    
    // تعطيل الزر وعرض المؤشر
    btn.disabled = true;
    spinner.classList.remove('d-none');
    
    try {
        const response = await fetch('https://zmyl.azurewebsites.net/api/SavedFiles', {
            method: 'POST',
            headers: {
                'accept': 'text/plain',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: parseInt(fileId)
            })
        });
        
        if (response.ok) {
            // نجحت العملية
            showToast('تمت إضافة الملف إلى المفضلة بنجاح! <a href="/profile/favorite-files.html" class="text-decoration-none fw-bold text-white">عرض المفضلة</a>', 'success');
            
            // تغيير نص الزر ولونه
            btn.innerHTML = '<i class="fas fa-check me-2"></i>تمت الإضافة';
            btn.classList.remove('btn-outline-warning');
            btn.classList.add('btn-success');
            
            // منع الضغط مرة أخرى
            btn.onclick = null;
        } else {
            const errorText = await response.text();
            if (response.status === 401) {
                showToast('انتهت صلاحية جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى', 'error');
            } else if (response.status === 409) {
                showToast('هذا الملف موجود بالفعل في المفضلة', 'error');
                // تحديث الزر ليظهر أنه مضاف بالفعل
                btn.innerHTML = '<i class="fas fa-check me-2"></i>موجود في المفضلة';
                btn.classList.remove('btn-outline-warning');
                btn.classList.add('btn-success');
                btn.onclick = null;
            } else {
                showToast(errorText || 'فشل في إضافة الملف إلى المفضلة', 'error');
            }
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
        // إعادة تفعيل الزر وإخفاء المؤشر إذا لم تنجح العملية
        if (!btn.classList.contains('btn-success')) {
            btn.disabled = false;
        }
        spinner.classList.add('d-none');
    }
}

// دالة عرض الرسائل
function showToast(message, type = 'primary') {
    const toastContainer = document.querySelector('#toastSite');
    const toast = toastContainer.querySelector('.toast');
    const toastBody = toast.querySelector('.toast-body');
    
    // تحديد نوع التنبيه
    toast.className = 'toast align-items-center border-0 m-auto';
    if (type === 'success') {
        toast.classList.add('text-bg-success');
    } else if (type === 'error') {
        toast.classList.add('text-bg-danger');
    } else {
        toast.classList.add('text-bg-primary');
    }
    
    toastBody.innerHTML = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// إضافة ملاحظة للملف
async function addFileNote() {
    const content = document.getElementById('fileNoteContent').value.trim();
    const saveBtn = document.getElementById('saveFileNoteBtn');
    const spinner = document.getElementById('saveFileNoteSpinner');
    const icon = document.getElementById('saveFileNoteIcon');
    
    if (!content) {
        document.getElementById('fileNoteContent').classList.add('is-invalid');
        return;
    }

    // إزالة رسالة الخطأ إذا كانت موجودة
    document.getElementById('fileNoteContent').classList.remove('is-invalid');

    try {
        // تفعيل حالة التحميل
        saveBtn.disabled = true;
        spinner.classList.remove('d-none');
        icon.classList.add('d-none');

        const token = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        if (!token) {
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            return;
        }

        // الحصول على معرف الملف من الرابط
        const fileId = await getParam('id');
        if (!fileId) {
            showToast('معرف الملف غير صحيح', 'error');
            return;
        }

        const noteData = {
            content: content,
            type: 'file', // نوع الملاحظة: file
            fileId: parseInt(fileId)
        };

        const response = await fetch('https://zmyl.azurewebsites.net/api/StudentNotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(noteData)
        });

        if (response.ok) {
            showToast('تم حفظ الملاحظة بنجاح', 'success');
            
            // إغلاق المودال
            const modal = bootstrap.Modal.getInstance(document.getElementById('addFileNoteModal'));
            modal.hide();
            
            // مسح النموذج
            document.getElementById('fileNoteContent').value = '';
        } else {
            if (response.status === 401) {
                // انتهت صلاحية التوكن - توجيه لصفحة تسجيل الدخول
                localStorage.removeItem('userToken');
                localStorage.removeItem('authToken');
                showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                const errorData = await response.text();
                showToast(errorData || 'حدث خطأ أثناء حفظ الملاحظة', 'error');
            }
        }
    } catch (error) {
        console.error('خطأ في إضافة الملاحظة:', error);
        showToast('حدث خطأ أثناء حفظ الملاحظة', 'error');
    } finally {
        // إلغاء حالة التحميل
        saveBtn.disabled = false;
        spinner.classList.add('d-none');
        icon.classList.remove('d-none');
    }
}

// إضافة مستمع الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // مسح النموذج عند إغلاق مودال إضافة الملاحظة
    const addFileNoteModal = document.getElementById('addFileNoteModal');
    if (addFileNoteModal) {
        addFileNoteModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('fileNoteContent').value = '';
            document.getElementById('fileNoteContent').classList.remove('is-invalid');
        });
    }
    
    // مسح النموذج عند إغلاق مودال الإبلاغ
    const reportFileModal = document.getElementById('reportFileModal');
    if (reportFileModal) {
        reportFileModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('reportText').value = '';
            document.getElementById('reportText').classList.remove('is-invalid');
        });
    }
});

// ربط دالة إضافة الملاحظة بالزر بعد إنشاء الأزرار ديناميكياً
function bindFileNoteEvents() {
    const saveFileNoteBtn = document.getElementById('saveFileNoteBtn');
    if (saveFileNoteBtn) {
        saveFileNoteBtn.removeEventListener('click', addFileNote); // إزالة المستمع القديم إن وجد
        saveFileNoteBtn.addEventListener('click', addFileNote);
    }
    
    // ربط دالة الإبلاغ بالزر
    const submitFileReportBtn = document.getElementById('submitFileReportBtn');
    if (submitFileReportBtn) {
        submitFileReportBtn.removeEventListener('click', submitFileReport); // إزالة المستمع القديم إن وجد
        submitFileReportBtn.addEventListener('click', submitFileReport);
    }
}

// دالة إرسال إبلاغ عن الملف
async function submitFileReport() {
    const reportText = document.getElementById('reportText').value.trim();
    const submitBtn = document.getElementById('submitFileReportBtn');
    const spinner = document.getElementById('reportFileSpinner');
    const icon = document.getElementById('reportFileIcon');
    
    if (!reportText) {
        document.getElementById('reportText').classList.add('is-invalid');
        showToast('يرجى كتابة سبب الإبلاغ', 'error');
        return;
    }

    // إزالة رسالة الخطأ إذا كانت موجودة
    document.getElementById('reportText').classList.remove('is-invalid');

    try {
        // تفعيل حالة التحميل
        submitBtn.disabled = true;
        spinner.classList.remove('d-none');
        icon.classList.add('d-none');

        const token = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        if (!token) {
            showToast('يرجى تسجيل الدخول أولاً', 'error');
            return;
        }

        // الحصول على معرف الملف من الرابط
        const fileId = await getParam('id');
        if (!fileId) {
            showToast('معرف الملف غير صحيح', 'error');
            return;
        }

        const reportData = {
            fileId: parseInt(fileId),
            reportText: reportText
        };

        const response = await fetch('https://zmyl.azurewebsites.net/api/FileReports/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            showToast('تم إرسال الإبلاغ بنجاح، شكراً لك', 'success');
            
            // إغلاق المودال
            const modal = bootstrap.Modal.getInstance(document.getElementById('reportFileModal'));
            modal.hide();
            
            // مسح النموذج
            document.getElementById('reportText').value = '';
        } else {
            if (response.status === 401) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('authToken');
                showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else if (response.status === 409) {
                showToast('تم إرسال إبلاغ مسبق على هذا الملف', 'warning');
            } else {
                const errorData = await response.text();
                showToast(errorData || 'حدث خطأ أثناء إرسال الإبلاغ', 'error');
            }
        }
    } catch (error) {
        console.error('خطأ في إرسال الإبلاغ:', error);
        showToast('حدث خطأ أثناء إرسال الإبلاغ', 'error');
    } finally {
        // إلغاء حالة التحميل
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
        icon.classList.remove('d-none');
    }
}

// Vote function for Quora-style voting
function vote(direction) {
    // Delegate to the toggleVote API flow using the arrow buttons
    try {
        if (direction === 'up') {
            const btn = document.getElementById('upVoteBtn');
            if (btn) toggleVote(btn, 'upVote');
        } else if (direction === 'down') {
            const btn = document.getElementById('downVoteBtn');
            if (btn) toggleVote(btn, 'downVote');
        }
    } catch (err) {
        console.error('Error delegating vote:', err);
    }
}

/* ------------------ Comments system (Facebook-like) ------------------ */
// Short-time guard to avoid immediate close after opening due to bubbling/timing
let __commentsPanelJustOpenedAt = 0;
let __commentsPanelOpening = false;

// Helper function to get authentication token
function getAuthToken() {
    try {
        // Allow passing a token via URL for quick testing: /file/index.html?id=8266&token=XYZ
        const params = new URLSearchParams(window.location.search);
        const qToken = params.get('token');
        if (qToken && qToken.length > 10) {
            // Persist for subsequent requests in this session
            localStorage.setItem('authToken', qToken);
            return qToken;
        }
    } catch (_) { /* noop */ }

    return (window.authHelper && typeof window.authHelper.getToken === 'function')
        ? window.authHelper.getToken()
        : (localStorage.getItem('userToken') || localStorage.getItem('authToken'));
}

// Helper function to get authentication headers
function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
    // The API often responds with JSON while advertising text/plain; accept both
    'Content-Type': 'application/json',
    'accept': 'text/plain'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        console.debug('[Comments] getAuthHeaders', {
            hasToken: !!token,
            tokenLen: token ? token.length : 0,
            accept: headers.accept
        });
    } catch (_) {}
    
    return headers;
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    const token = getAuthToken();
    return token && token.length > 0;
}

async function loadComments(fileId) {
    try {
    const headers = getAuthHeaders();
    const url = `https://zmyl.azurewebsites.net/api/Comment/file/${fileId}`;
    console.info('[Comments] loadComments: start', { fileId, url });
    const resp = await fetch(url, {
            method: 'GET',
            headers: headers
        });
    console.info('[Comments] loadComments: response', { status: resp.status, ok: resp.ok });
        
        if (!resp.ok) {
            if (resp.status === 401) {
                console.warn('Unauthorized access to comments, may need login');
                // Don't show error to user, just return empty array
                return [];
            } else if (resp.status === 404) {
                console.info('No comments found for this file');
                return [];
            } else {
                console.error('Failed to load comments:', resp.status, resp.statusText);
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            }
        }
        
    const comments = await resp.json();
    // Debug: log and store returned results for inspection
    try {
        const count = Array.isArray(comments) ? comments.length : 0;
        console.debug('[Comments] loadComments: parsed', { count });
        console.info('[Comments] loadComments: data', comments);
        if (Array.isArray(comments)) {
            // Show a concise table view
            console.table(comments.map(c => ({
                id: c.commentId,
                user: c?.userProfile?.fullName || c?.userProfile?.userName,
                text: c.commentText,
                date: c.commentDate,
                up: c.upVotesCount,
                down: c.downVotesCount
            })));
        }
        // Keep a rolling log on window for quick access during debugging
        window.__commentsLog = window.__commentsLog || [];
        window.__commentsLog.push({
            fileId,
            url,
            at: new Date().toISOString(),
            count,
            data: comments
        });
    } catch (_) { /* ignore logging issues */ }
        return comments || [];
    } catch (err) {
    console.error('[Comments] loadComments: error', err);
        throw err; // Re-throw to be handled by caller
    }
}

// Ensure comments panel contains the required inner markup once
function initCommentsPanel() {
    const panel = document.getElementById('commentsPanel');
    if (!panel) { console.warn('[Comments] initCommentsPanel: #commentsPanel not found'); return; }
    const container = panel.querySelector('.comments-container');
    if (!container) { console.warn('[Comments] initCommentsPanel: .comments-container not found'); return; }

    // If container already has content, ensure required pieces exist; otherwise inject full markup
    const hasList = !!container.querySelector('#commentsList');
    const hasLoading = !!container.querySelector('#commentsLoading');
    const hasEmpty = !!container.querySelector('#commentsEmpty');

    if (!hasList) {
        container.innerHTML = `
        <div class="comments-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <div class="d-flex align-items-center gap-2">
                <i class="far fa-comments"></i>
                <strong>التعليقات</strong>
                <span class="badge bg-secondary ms-2"><span class="comments-count">0</span></span>
            </div>
            <button type="button" id="closeCommentsBtn" class="btn btn-sm btn-light">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="comments-content">
            <div id="commentsList" class="comments-list p-2">
                <div id="commentsLoading" class="text-center text-muted py-4">
                    <i class="fas fa-spinner fa-spin"></i>
                    <div class="mt-2">جارِ تحميل التعليقات...</div>
                </div>
                <div id="commentsEmpty" class="text-center text-muted py-4 d-none">
                    <i class="far fa-comments mb-2" style="font-size:1.5rem;"></i>
                    <div>لا توجد تعليقات بعد</div>
                </div>
            </div>
        </div>

        <div class="comment-input-section">
            <div class="comment-input-container">
                <img src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg" 
                     alt="صورتك الشخصية" 
                     class="comment-input-avatar"
                     id="userCommentAvatar">
                <div class="comment-input-field">
                    <textarea id="newCommentText" 
                              placeholder="اكتب تعليق..." 
                              rows="1"
                              aria-label="أضف تعليق"></textarea>
                    <button id="postCommentBtn" class="comment-send-btn" disabled>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>`;
        console.debug('[Comments] initCommentsPanel: injected full markup');
    } else {
        // Ensure loading and empty placeholders exist
        if (!hasLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'commentsLoading';
            loadingDiv.className = 'text-center text-muted py-4';
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i><div class="mt-2">جارِ تحميل التعليقات...</div>';
            container.querySelector('#commentsList').appendChild(loadingDiv);
        }
        if (!hasEmpty) {
            const emptyDiv = document.createElement('div');
            emptyDiv.id = 'commentsEmpty';
            emptyDiv.className = 'text-center text-muted py-4 d-none';
            emptyDiv.innerHTML = '<i class="far fa-comments mb-2" style="font-size:1.5rem;"></i><div>لا توجد تعليقات بعد</div>';
            container.querySelector('#commentsList').appendChild(emptyDiv);
        }
        console.debug('[Comments] initCommentsPanel: ensured placeholders', { hasLoading: true, hasEmpty: true });
    }
}

function createCommentElement(comment) {
    const el = document.createElement('div');
    el.className = 'comment-item';

    // Create comment structure
    const avatar = document.createElement('img');
    avatar.className = 'comment-avatar';
    avatar.src = comment.userProfile && comment.userProfile.profilePictureUrl ? 
        //comment.userProfile.profilePictureUrl : 'assets/img/site/default-avatar.svg';
        comment.userProfile.profilePictureUrl : 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    const commentUserName = comment.userProfile ? (comment.userProfile.userName || '') : '';
    const commentUserId = comment.userProfile ? (comment.userProfile.userId || '') : '';
    // Prioritize userId for reliable profile navigation
    let commentProfileUrl = '#';
    if (commentUserId && commentUserId !== 'null' && String(commentUserId).trim() !== '') {
        commentProfileUrl = `/profile.html?id=${commentUserId}`;
    } else if (commentUserName && String(commentUserName).trim() !== '') {
        commentProfileUrl = `/profile.html?u=${encodeURIComponent(commentUserName)}`;
    }
    avatar.alt = comment.userProfile ? (comment.userProfile.fullName || comment.userProfile.userName) : 'مستخدم';
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', () => { if (commentProfileUrl !== '#') window.location.href = commentProfileUrl; });
    
    // Handle image loading errors
    avatar.onerror = function() {
        this.src = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    };

    const body = document.createElement('div');
    body.className = 'comment-body';

    // Comment content bubble
    const content = document.createElement('div');
    content.className = 'comment-content';

    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    
    const authorLink = document.createElement('a');
    authorLink.className = 'comment-author';
    authorLink.href = commentProfileUrl;
    authorLink.textContent = comment.userProfile ? (comment.userProfile.fullName || comment.userProfile.userName) : 'مستخدم';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'comment-time';
    
    // Format date to show relative time
    const commentDate = new Date(comment.commentDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    let timeText;
    if (diffInMinutes < 1) {
        timeText = 'الآن';
    } else if (diffInMinutes < 60) {
        timeText = `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        timeText = `منذ ${hours} ساعة`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days < 7) {
            timeText = `منذ ${days} يوم`;
        } else {
            timeText = commentDate.toLocaleDateString('ar-SA');
        }
    }
    
    timeSpan.textContent = timeText;
    timeSpan.title = commentDate.toLocaleString('ar-SA'); // Show full date on hover

    meta.appendChild(authorLink);
    meta.appendChild(timeSpan);

    const text = document.createElement('div');
    text.className = 'comment-text';
    text.textContent = comment.commentText || '';

    content.appendChild(meta);
    content.appendChild(text);

    // Comment actions
    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    const likeBtn = document.createElement('button');
    likeBtn.className = 'btn-comment-like';
    likeBtn.innerHTML = `<i class="far fa-heart"></i> <span>${comment.upVotesCount || 0}</span>`;
    likeBtn.onclick = async function() {
        await upvoteComment(comment.commentId, likeBtn);
    };

    const replyBtn = document.createElement('button');
    replyBtn.className = 'comment-action-btn';
    replyBtn.textContent = 'رد';
    replyBtn.onclick = function() {
        openReplyBox(el, comment.commentId);
    };

    const reportBtn = document.createElement('button');
    reportBtn.className = 'comment-action-btn';
    reportBtn.textContent = 'إبلاغ';
    reportBtn.style.color = '#e41e3f';
    reportBtn.onclick = function() {
        // Open styled modal like file report
        const inputId = document.getElementById('reportCommentId');
        const inputText = document.getElementById('reportCommentText');
        if (inputId) inputId.value = comment.commentId;
        if (inputText) inputText.value = '';
        try {
            const modalEl = document.getElementById('reportCommentModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            } else {
                // fallback
                reportCommentPrompt(comment.commentId);
            }
        } catch (_) {
            reportCommentPrompt(comment.commentId);
        }
    };

    actions.appendChild(likeBtn);
    actions.appendChild(replyBtn);
    actions.appendChild(reportBtn);

    body.appendChild(content);
    body.appendChild(actions);

    // Replies container
    const repliesCt = document.createElement('div');
    repliesCt.className = 'comment-replies';
    
    if (comment.replies && comment.replies.length) {
        comment.replies.forEach(reply => {
            const replyEl = createReplyElement(reply);
            repliesCt.appendChild(replyEl);
        });
    }

    body.appendChild(repliesCt);

    el.appendChild(avatar);
    el.appendChild(body);
    el.dataset.commentId = comment.commentId;
    
    return el;
}

function createReplyElement(reply) {
    const replyDiv = document.createElement('div');
    replyDiv.className = 'comment-reply';
    
    const replyItem = document.createElement('div');
    replyItem.className = 'comment-item';
    
    const avatar = document.createElement('img');
    avatar.className = 'comment-avatar';
    avatar.src = reply.userProfile && reply.userProfile.profilePictureUrl ? 
        reply.userProfile.profilePictureUrl : 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    const replyUserName = reply.userProfile ? (reply.userProfile.userName || '') : '';
    const replyUserId = reply.userProfile ? (reply.userProfile.userId || '') : '';
    // Prioritize userId for reliable profile navigation
    let replyProfileUrl = '#';
    if (replyUserId && replyUserId !== 'null' && String(replyUserId).trim() !== '') {
        replyProfileUrl = `/profile.html?id=${replyUserId}`;
    } else if (replyUserName && String(replyUserName).trim() !== '') {
        replyProfileUrl = `/profile.html?u=${encodeURIComponent(replyUserName)}`;
    }
    avatar.alt = reply.userProfile ? (reply.userProfile.fullName || reply.userProfile.userName) : 'مستخدم';
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', () => { if (replyProfileUrl !== '#') window.location.href = replyProfileUrl; });
    
    // Handle image loading errors
    avatar.onerror = function() {
        this.src = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    };

    const body = document.createElement('div');
    body.className = 'comment-body';

    const content = document.createElement('div');
    content.className = 'comment-content';

    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    
    const authorLink = document.createElement('a');
    authorLink.className = 'comment-author';
    authorLink.href = replyProfileUrl;
    authorLink.textContent = reply.userProfile ? (reply.userProfile.fullName || reply.userProfile.userName) : 'مستخدم';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'comment-time';
    
    // Format date to show relative time
    const replyDate = new Date(reply.commentDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now - replyDate) / (1000 * 60));
    
    let timeText;
    if (diffInMinutes < 1) {
        timeText = 'الآن';
    } else if (diffInMinutes < 60) {
        timeText = `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        timeText = `منذ ${hours} ساعة`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days < 7) {
            timeText = `منذ ${days} يوم`;
        } else {
            timeText = replyDate.toLocaleDateString('ar-SA');
        }
    }
    
    timeSpan.textContent = timeText;
    timeSpan.title = replyDate.toLocaleString('ar-SA'); // Show full date on hover

    meta.appendChild(authorLink);
    meta.appendChild(timeSpan);

    const text = document.createElement('div');
    text.className = 'comment-text';
    text.textContent = reply.commentText || '';

    content.appendChild(meta);
    content.appendChild(text);

    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    const likeBtn = document.createElement('button');
    likeBtn.className = 'btn-comment-like';
    likeBtn.innerHTML = `<i class="far fa-heart"></i> <span>${reply.upVotesCount || 0}</span>`;
    likeBtn.onclick = async function() {
        await upvoteComment(reply.commentId, likeBtn);
    };

    const reportBtn = document.createElement('button');
    reportBtn.className = 'comment-action-btn';
    reportBtn.textContent = 'إبلاغ';
    reportBtn.style.color = '#e41e3f';
    reportBtn.onclick = function() {
        reportCommentPrompt(reply.commentId);
    };

    actions.appendChild(likeBtn);
    actions.appendChild(reportBtn);

    body.appendChild(content);
    body.appendChild(actions);

    replyItem.appendChild(avatar);
    replyItem.appendChild(body);
    replyDiv.appendChild(replyItem);
    
    return replyDiv;
}

function openReplyBox(container, replyToId) {
    // if already open, toggle
    const existing = container.querySelector('.reply-box');
    if (existing) { existing.remove(); return; }
    
    if (!isAuthenticated()) {
        showToast('يرجى تسجيل الدخول للرد على التعليقات', 'error');
        return;
    }
    
    const box = document.createElement('div');
    box.className = 'reply-box';
    
    const replyContainer = document.createElement('div');
    replyContainer.className = 'reply-input-container';
    
    const avatar = document.createElement('img');
    avatar.className = 'comment-input-avatar';
    avatar.src = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    avatar.alt = 'صورتك الشخصية';
    avatar.onerror = function() { this.src = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg'; };

    const inputField = document.createElement('div');
    inputField.className = 'comment-input-field';
    inputField.style.position = 'relative';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'reply-text';
    textarea.placeholder = 'اكتب رد...';
    textarea.rows = 1;
    
    const sendBtn = document.createElement('button');
    sendBtn.className = 'reply-send-btn';
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendBtn.disabled = true;
    
    // Enable/disable send button based on text
    textarea.addEventListener('input', function() {
        sendBtn.disabled = !this.value.trim();
    });
    
    // Auto-resize textarea (smooth, dynamic)
    const autoGrowReply = () => {
        textarea.style.height = 'auto';
        const maxH = Math.floor(window.innerHeight * 0.4);
        const next = Math.min(textarea.scrollHeight, maxH);
        textarea.style.height = next + 'px';
    };
    textarea.addEventListener('input', autoGrowReply);
    setTimeout(autoGrowReply, 0);
    
    inputField.appendChild(textarea);
    inputField.appendChild(sendBtn);
    
    replyContainer.appendChild(avatar);
    replyContainer.appendChild(inputField);
    box.appendChild(replyContainer);

    sendBtn.onclick = async () => {
        const txt = textarea.value.trim();
        if (!txt) return;
        
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            if (!isAuthenticated()) {
                showToast('يرجى تسجيل الدخول أولاً', 'error');
                return;
            }
            
            const fileId = await getParam('id');
            // Optimistic reply element
            const { name, avatar: userAvatar } = getCurrentUserForComments();
            const tempReplyId = 'temp-r-' + Date.now();
            const optimisticReply = {
                commentId: tempReplyId,
                commentText: txt,
                commentDate: new Date().toISOString(),
                upVotesCount: 0,
                downVotesCount: 0,
                userProfile: { fullName: name, userName: name, profilePictureUrl: userAvatar }
            };
            const replyEl = createReplyElement(optimisticReply);
            const replies = container.querySelector('.comment-replies');
            if (replies) {
                const inner = replyEl.querySelector('.comment-item');
                if (inner) inner.classList.add('is-pending');
                replies.appendChild(replyEl);
            }
            // Clear box quickly for UX
            box.remove();
            const body = {
                commentText: txt,
                type: 'file',
                fileId: parseInt(fileId),
                replyToCommentId: replyToId
            };
            
            const headers = getAuthHeaders();
            
            const response = await fetch('https://zmyl.azurewebsites.net/api/Comment', {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            
            const okStatuses = [200, 201, 203, 204];
            if (okStatuses.includes(response.status)) {
                // Confirm optimistic reply
                try {
                    const saved = await response.json();
                    if (saved && saved.commentId) {
                        replyEl.querySelector('.comment-item').classList.remove('is-pending');
                        replyEl.querySelector('.comment-item').dataset.commentId = saved.commentId;
                    } else {
                        replyEl.querySelector('.comment-item').classList.remove('is-pending');
                    }
                } catch (_) {
                    replyEl.querySelector('.comment-item').classList.remove('is-pending');
                }
                showToast('تم إضافة الرد بنجاح', 'success');
            } else if (response.status === 401) {
                // Remove optimistic reply on failure
                try { replyEl.remove(); } catch (_) {}
                showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
            } else {
                try { replyEl.remove(); } catch (_) {}
                showToast('فشل في إضافة الرد', 'error');
            }
        } catch (error) {
            console.error('Error posting reply:', error);
            try { const replies = container.querySelector('.comment-replies'); if (replies) replies.lastElementChild?.remove(); } catch (_) {}
            showToast('حدث خطأ أثناء إضافة الرد', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    };

    // Insert after the comment actions
    const commentBody = container.querySelector('.comment-body');
    commentBody.appendChild(box);
    // عدم استخدام focus لتحسين تجربة الهاتف
    // textarea.focus();
}

async function upvoteComment(commentId, btnEl) {
    try {
        if (!isAuthenticated()) { 
            showToast('يرجى تسجيل الدخول للتفاعل مع التعليقات', 'error'); 
            return; 
        }
        
        // Add loading state (capture current count before switching to spinner)
        const originalHtml = btnEl.innerHTML;
        let currentCount = 0;
        try {
            const c = btnEl.querySelector('span');
            if (c) currentCount = parseInt(c.textContent || '0');
        } catch (_) { /* ignore */ }
        btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btnEl.disabled = true;
        
        const headers = getAuthHeaders();
        const res = await fetch(`https://zmyl.azurewebsites.net/api/CommentUpVote/${commentId}/upvote`, { 
            method: 'POST', 
            headers: headers
        });
        
        const okStatuses = [200, 201, 203, 204];
        if (okStatuses.includes(res.status)) {
            // toggle liked UI with animation
            btnEl.classList.add('liked');
            
            // Add visual feedback
            btnEl.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btnEl.style.transform = 'scale(1)';
            }, 150);
            
            // increment count visually
            const nextCount = currentCount + 1;
            btnEl.innerHTML = `<i class="fas fa-heart text-danger"></i> <span>${nextCount}</span>`;
            
        } else {
            btnEl.innerHTML = originalHtml;
            if (res.status === 401) {
                showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
            } else {
                showToast('فشل في التفاعل مع التعليق', 'error');
            }
        }
    } catch (e) { 
        console.error(e); 
        btnEl.innerHTML = btnEl.innerHTML.replace('fa-spinner fa-spin', 'fa-heart');
        showToast('حدث خطأ في الاتصال', 'error'); 
    } finally {
        btnEl.disabled = false;
    }
}

function reportCommentPrompt(commentId) {
    const reason = prompt('سبب الإبلاغ عن التعليق:');
    if (!reason) return;
    submitCommentReport(commentId, reason);
}

async function submitCommentReport(commentId, text) {
    try {
        if (!isAuthenticated()) { 
            showToast('يرجى تسجيل الدخول للإبلاغ عن التعليقات', 'error'); 
            return; 
        }
        
        const body = { commentId: commentId, commentReportText: text };
        const headers = getAuthHeaders();
        
        const res = await fetch('https://zmyl.azurewebsites.net/api/CommentReport', { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(body) 
        });
        
        if (res.ok) {
            showToast('تم إرسال البلاغ بنجاح', 'success'); 
        } else if (res.status === 401) {
            showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
        } else if (res.status === 409) {
            showToast('تم إرسال بلاغ مسبق على هذا التعليق', 'warning');
        } else {
            showToast('فشل في إرسال البلاغ', 'error');
        }
    } catch (e) { 
        console.error(e); 
        showToast('حدث خطأ في الاتصال', 'error'); 
    }
}

// Wire up modal submit for comment report (same UX as file report)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('submitCommentReportBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            const spinner = document.getElementById('reportCommentSpinner');
            const icon = document.getElementById('reportCommentIcon');
            const idInput = document.getElementById('reportCommentId');
            const textInput = document.getElementById('reportCommentText');
            const cid = idInput ? idInput.value : '';
            const text = textInput ? textInput.value.trim() : '';
            if (!cid || !text) {
                showToast('يرجى كتابة سبب واضح للإبلاغ', 'warning');
                return;
            }
            if (spinner) spinner.classList.remove('d-none');
            if (icon) icon.classList.add('d-none');
            btn.disabled = true;
            await submitCommentReport(parseInt(cid), text);
            // close modal on success
            const modalEl = document.getElementById('reportCommentModal');
            if (modalEl) {
                const inst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                inst.hide();
            }
        } catch (e) {
            console.error(e);
        } finally {
            const spinner = document.getElementById('reportCommentSpinner');
            const icon = document.getElementById('reportCommentIcon');
            if (spinner) spinner.classList.add('d-none');
            if (icon) icon.classList.remove('d-none');
            btn.disabled = false;
        }
    });
});

async function renderCommentsForFile(fileId) {
    let list = document.getElementById('commentsList');
    let loading = document.getElementById('commentsLoading');
    let empty = document.getElementById('commentsEmpty');
    
    try {
    console.info('[Comments] render: start', { fileId, hasList: !!list, hasLoading: !!loading, hasEmpty: !!empty });
        // If key nodes are missing, initialize panel placeholders
        if (!list || !loading || !empty) {
            initCommentsPanel();
            list = document.getElementById('commentsList');
            loading = document.getElementById('commentsLoading');
            empty = document.getElementById('commentsEmpty');
        }

        if (loading && loading.classList) loading.classList.remove('d-none');
        if (empty && empty.classList) empty.classList.add('d-none');
        
        const comments = await loadComments(fileId);
        
    if (loading && loading.classList) loading.classList.add('d-none');
    if (list) list.innerHTML = '';
        
        if (Array.isArray(comments) && comments.length === 0) {
            if (!empty) {
                // Create an empty placeholder on the fly if missing
                empty = document.createElement('div');
                empty.id = 'commentsEmpty';
                empty.className = 'text-center text-muted py-4';
                empty.innerHTML = '<i class="far fa-comments mb-2" style="font-size:1.5rem;"></i><div>لا توجد تعليقات بعد</div>';
            }
            if (list) list.appendChild(empty);
            if (empty && empty.classList) empty.classList.remove('d-none');
        } else if (Array.isArray(comments)) {
            comments.forEach(comment => {
                const commentEl = createCommentElement(comment);
                if (list) list.appendChild(commentEl);
            });
            if (empty && empty.classList) empty.classList.add('d-none');
        }
        
        // Update comment counts (panel badges only). Avoid overwriting main UI link label.
        document.querySelectorAll('.comments-count').forEach(el => {
            // Only update badges inside the comments panel header, not the main UI trigger link
            if (el.closest('.comments-header')) {
                el.textContent = Array.isArray(comments) ? comments.length : 0;
            }
        });
    console.info('[Comments] render: done', { count: comments.length });
        
    } catch (error) {
    console.error('[Comments] render: error', error);
    if (loading && loading.classList) loading.classList.add('d-none');
        
        let errorMessage = 'حدث خطأ في تحميل التعليقات';
        
        // Provide more specific error messages
        if (error.message.includes('HTTP 401')) {
            errorMessage = 'يرجى تسجيل الدخول لعرض التعليقات';
        } else if (error.message.includes('HTTP 403')) {
            errorMessage = 'غير مصرح لك بعرض التعليقات';
        } else if (error.message.includes('HTTP 404')) {
            errorMessage = 'لا توجد تعليقات لهذا الملف';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت';
        }
        
    if (list) {
    list.innerHTML = `<div class="text-center p-4 text-danger">
            <i class="fas fa-exclamation-triangle mb-2" style="font-size: 2rem;"></i>
            <div>${errorMessage}</div>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="refreshComments()">
                <i class="fas fa-refresh me-1"></i> إعادة المحاولة
            </button>
    </div>`;
    }
    }
}

async function refreshComments() {
    const fileId = await getParam('id');
    console.debug('[Comments] refresh: fileId', fileId);
    if (!fileId) return;
    await renderCommentsForFile(fileId);
}

// Load user avatar for comment input
function loadUserAvatar() {
    const avatarEl = document.getElementById('userCommentAvatar');
    if (!avatarEl) { console.warn('[Comments] loadUserAvatar: #userCommentAvatar not found'); return; }
    
    // Try to get user info from authHelper or localStorage
    let userAvatar = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    
    if (window.authHelper && window.authHelper.getUserInfo) {
        const userInfo = window.authHelper.getUserInfo();
        if (userInfo && userInfo.profilePictureUrl) {
            userAvatar = userInfo.profilePictureUrl;
        }
    }
    
    avatarEl.src = userAvatar;
    avatarEl.onerror = function() {
      //  this.src = 'assets/img/site/default-avatar.svg';
        this.src = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    };
    console.debug('[Comments] loadUserAvatar: set', { src: avatarEl.src });
}

// Get current user info for optimistic comments
function getCurrentUserForComments() {
    let name = 'أنت';
    let avatar = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg';
    try {
        if (window.authHelper && typeof window.authHelper.getUserInfo === 'function') {
            const u = window.authHelper.getUserInfo();
            if (u) {
                name = u.fullName || u.userName || name;
                if (u.profilePictureUrl) avatar = u.profilePictureUrl;
            }
        }
    } catch (_) {}
    // Fallback to the input avatar src if present
    try {
        const el = document.getElementById('userCommentAvatar');
        if (el && el.src) avatar = el.src;
    } catch (_) {}
    return { name, avatar };
}

// Wire up comment panel actions
document.addEventListener('DOMContentLoaded', function() {
    try {
        const oc = document.querySelectorAll('.open-comments');
        console.info('[Comments] DOMContentLoaded: wiring handlers', { openCommentsCount: oc.length });
    } catch (_) {}
    // Build comments panel UI once if not present
    initCommentsPanel();
    // Open comments panel
    document.querySelectorAll('.open-comments').forEach(a => {
        a.addEventListener('click', async function(e) {
            e.preventDefault();
            // Avoid any anchor side-effects
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
            // Require login before opening comments
            if (!isAuthenticated()) {
                try { console.group('[Comments] open-click'); } catch (_) {}
                showToast('يرجى تسجيل الدخول لعرض التعليقات', 'error');
                // Prefer a polished Bootstrap modal if present
                const modalEl = document.getElementById('loginRequiredModal');
                if (modalEl && window.bootstrap && window.bootstrap.Modal) {
                    try {
                        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                        // Wire the button once
                        const goBtn = document.getElementById('loginRequiredGoBtn');
                        if (goBtn && !goBtn.__zrBound) {
                            goBtn.__zrBound = true;
                            goBtn.addEventListener('click', function() {
                                try { modal.hide(); } catch (_) {}
                                if (window.authHelper && typeof window.authHelper.redirectToLogin === 'function') {
                                    window.authHelper.redirectToLogin();
                                } else {
                                    window.location.href = '/login.html';
                                }
                            });
                        }
                        modal.show();
                    } catch (_) {
                        // fallback to confirm
                        if (window.confirm('يجب تسجيل الدخول لعرض التعليقات. هل تريد الانتقال لصفحة تسجيل الدخول الآن؟')) {
                            if (window.authHelper && typeof window.authHelper.redirectToLogin === 'function') {
                                window.authHelper.redirectToLogin();
                            } else {
                                window.location.href = '/login.html';
                            }
                        }
                    }
                } else {
                    // fallback to confirm
                    if (window.confirm('يجب تسجيل الدخول لعرض التعليقات. هل تريد الانتقال لصفحة تسجيل الدخول الآن؟')) {
                        if (window.authHelper && typeof window.authHelper.redirectToLogin === 'function') {
                            window.authHelper.redirectToLogin();
                        } else {
                            window.location.href = '/login.html';
                        }
                    }
                }
                try { console.groupEnd && console.groupEnd(); } catch (_) {}
                return;
            }
            // Ensure UI exists (in case loaded late)
            initCommentsPanel();
            console.group('[Comments] open-click');
            console.debug('clicked target:', { tag: e.target?.tagName, classes: e.target?.className });
            const fileId = await getParam('id');
            console.debug('fileId:', fileId);
            if (!fileId) { console.warn('No fileId in URL'); console.groupEnd(); return; }
            
            const panel = document.getElementById('commentsPanel');
            if (!panel) { console.error('[Comments] open-click: #commentsPanel not found'); console.groupEnd(); return; }
            panel.classList.add('show');
            __commentsPanelJustOpenedAt = Date.now();
            __commentsPanelOpening = true;
            console.debug('panel show');
            
            // Load user avatar
            loadUserAvatar();
            
            // Disable overlay close while loading to avoid immediate close flicker
            const overlay = panel.querySelector('.comments-overlay');
            // Temporarily disable overlay pointer events while opening to avoid flicker
            const prevPointerEvents = overlay ? overlay.style.pointerEvents : '';
            if (overlay) overlay.style.pointerEvents = 'none';

            // Show loading state (with guards)
            let loading = document.getElementById('commentsLoading');
            let empty = document.getElementById('commentsEmpty');
            let list = document.getElementById('commentsList');
            if (!loading || !empty || !list) {
                console.warn('[Comments] elements missing; re-initializing panel UI');
                initCommentsPanel();
                loading = document.getElementById('commentsLoading');
                empty = document.getElementById('commentsEmpty');
                list = document.getElementById('commentsList');
            }
            console.debug('elements:', { hasLoading: !!loading, hasEmpty: !!empty, hasList: !!list });
            if (loading && loading.classList) loading.classList.remove('d-none');
            if (empty && empty.classList) empty.classList.add('d-none');
            if (list) {
                list.innerHTML = '';
                if (loading) list.appendChild(loading);
            }
            
            try {
                await renderCommentsForFile(fileId);
            } catch (err) {
                console.error('[Comments] open-click: render failed', err);
            }
            // Re-enable overlay clicks after opening completes
            if (overlay) overlay.style.pointerEvents = prevPointerEvents || '';
            __commentsPanelOpening = false;
            // عدم استخدام focus لتحسين تجربة الهاتف
            // const input = document.getElementById('newCommentText');
            // if (input) { input.focus(); }
            console.groupEnd();
        });
    });

    // Close comments panel
    // Delegated close button handler (works even if markup is injected later)
    document.addEventListener('click', function(evt) {
        const btn = evt.target && (evt.target.closest ? evt.target.closest('#closeCommentsBtn') : null);
        if (btn) {
            const panel = document.getElementById('commentsPanel');
            if (panel && panel.classList) {
                panel.classList.remove('show');
            }
        }
    });
    
    // Close panel when clicking outside
    const panel = document.getElementById('commentsPanel');
    if (panel) {
        panel.addEventListener('click', function(e) {
            // Close if clicking on overlay or main panel
            const t = e.target;
            const isOverlay = t && t.classList && t.classList.contains('comments-overlay');
            // Ignore clicks right after opening to prevent flicker
            if (__commentsPanelOpening || (Date.now() - __commentsPanelJustOpenedAt < 300)) {
                return;
            }
            if (e.target === this || isOverlay) {
                if (this.classList) this.classList.remove('show');
            }
        });
    }

    // Observe panel class changes for debugging unexpected hides
    try {
        const pnl = document.getElementById('commentsPanel');
        if (pnl && window.MutationObserver) {
            const obs = new MutationObserver((mutations) => {
                mutations.forEach(m => {
                    if (m.attributeName === 'class') {
                        const hasShow = pnl.classList.contains('show');
                        console.debug('[Comments] panel class change:', { show: hasShow, className: pnl.className });
                    }
                });
            });
            obs.observe(pnl, { attributes: true, attributeFilter: ['class'] });
        }
    } catch (_) { /* noop */ }

    // Handle comment input
    const commentInput = document.getElementById('newCommentText');
    const postBtn = document.getElementById('postCommentBtn');
    
    if (commentInput && postBtn) {
        // Auto-resize textarea (smooth and dynamic)
        const autoGrow = () => {
            commentInput.style.height = 'auto';
            const maxH = Math.floor(window.innerHeight * 0.5);
            const next = Math.min(commentInput.scrollHeight, maxH);
            commentInput.style.height = next + 'px';
        };
        commentInput.addEventListener('input', function() {
            autoGrow();
            // Enable/disable send button
            postBtn.disabled = !this.value.trim();
        });
        // initialize once
        setTimeout(autoGrow, 0);
        
        // Post comment (optimistic, no refetch)
        postBtn.addEventListener('click', async function() {
            const text = commentInput.value.trim();
            if (!text) return;
            
            // Build optimistic comment element and insert immediately
            const { name, avatar } = getCurrentUserForComments();
            const tempId = 'temp-' + Date.now();
            const optimistic = {
                commentId: tempId,
                commentText: text,
                commentDate: new Date().toISOString(),
                upVotesCount: 0,
                downVotesCount: 0,
                userProfile: { fullName: name, userName: name, profilePictureUrl: avatar },
                replies: []
            };
            const list = document.getElementById('commentsList');
            const loading = document.getElementById('commentsLoading');
            const empty = document.getElementById('commentsEmpty');
            if (loading) loading.classList.add('d-none');
            if (empty) empty.classList.add('d-none');
            const optimisticEl = createCommentElement(optimistic);
            optimisticEl.classList.add('is-pending');
            if (list) list.appendChild(optimisticEl);
            // Increase visible count (panel header badge only)
            document.querySelectorAll('.comments-count').forEach(el => {
                if (el.closest('.comments-header')) {
                    const v = parseInt(el.textContent || '0');
                    el.textContent = (v + 1).toString();
                }
            });
            // Clear input and set button state
            commentInput.value = '';
            commentInput.style.height = 'auto';
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            try {
                const fileId = await getParam('id');
                
                if (!isAuthenticated()) {
                    showToast('يرجى تسجيل الدخول أولاً', 'error');
                    // Revert optimistic insert
                    optimisticEl.remove();
                    document.querySelectorAll('.comments-count').forEach(el => {
                        if (el.closest('.comments-header')) {
                            const v = parseInt(el.textContent || '1');
                            el.textContent = Math.max(0, v - 1).toString();
                        }
                    });
                    return;
                }
                
                const headers = getAuthHeaders();
                
                const body = {
                    commentText: text,
                    type: 'file',
                    fileId: parseInt(fileId)
                };
                
                const response = await fetch('https://zmyl.azurewebsites.net/api/Comment', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body)
                });
                
                const okStatuses = [200, 201, 203, 204];
                if (okStatuses.includes(response.status)) {
                    // Confirm optimistic comment
                    optimisticEl.classList.remove('is-pending');
                    try {
                        // 204 No Content has no body; guard the parse
                        let saved = null;
                        if (response.status !== 204) {
                            saved = await response.json();
                        }
                        if (saved && saved.commentId) {
                            optimisticEl.dataset.commentId = saved.commentId;
                        }
                    } catch (_) { /* some endpoints return no body */ }
                    showToast('تم إضافة التعليق بنجاح', 'success');
                } else if (response.status === 401) {
                    optimisticEl.remove();
                    document.querySelectorAll('.comments-count').forEach(el => {
                        if (el.closest('.comments-header')) {
                            const v = parseInt(el.textContent || '1');
                            el.textContent = Math.max(0, v - 1).toString();
                        }
                    });
                    showToast('انتهت صلاحية جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
                } else {
                    optimisticEl.remove();
                    document.querySelectorAll('.comments-count').forEach(el => {
                        if (el.closest('.comments-header')) {
                            const v = parseInt(el.textContent || '1');
                            el.textContent = Math.max(0, v - 1).toString();
                        }
                    });
                    showToast('فشل في إضافة التعليق', 'error');
                }
            } catch (error) {
                console.error('Error posting comment:', error);
                // Rollback optimistic UI
                try { optimisticEl.remove(); } catch (_) {}
                document.querySelectorAll('.comments-count').forEach(el => {
                    const v = parseInt(el.textContent || '1');
                    el.textContent = Math.max(0, v - 1).toString();
                });
                showToast('حدث خطأ أثناء إضافة التعليق', 'error');
            } finally {
                this.disabled = true; // Will be enabled again when user types
                this.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        });
    }
});







