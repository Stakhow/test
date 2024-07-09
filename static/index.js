(function () {
    
    const results = document.querySelector('#response');
    
    const onClickHandler = (e) => {
        
        const TOTAL_REQUEST_LIMIT = 1000;
        const TOTAL_ACTIVE_REQUESTS_LIMIT = +document.querySelector('#limit').value;
        
        if (!TOTAL_ACTIVE_REQUESTS_LIMIT) return;
    
        let sentRequests = 0;
        let activeRequestsLimit = 0;
    
        e.target.disabled = true;
        
        const sendRequest = async () => {
        
            sentRequests += 1;
            activeRequestsLimit += 1;
        
            const checkConcurrency = cb => {
            
                if (sentRequests < TOTAL_REQUEST_LIMIT && activeRequestsLimit < TOTAL_ACTIVE_REQUESTS_LIMIT) cb();
                
                if (sentRequests >= TOTAL_REQUEST_LIMIT) e.target.disabled = false;
            
            };
        
            checkConcurrency(sendRequest);
        
            try {
                console.log('sentRequests', sentRequests);
                const response = await fetch(`/api?index=${sentRequests}`);
                
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
            
                const json = await response.json();
    
                logger(json.index, response.status);
            
                console.log(json);
            
            } catch (error) {
                console.error(error.message);
            } finally {
            
                if (activeRequestsLimit !== 1) activeRequestsLimit -= 1;
                checkConcurrency(sendRequest);
            }
        };
    
        sendRequest();
    };
    
    document.querySelector('#start').addEventListener('click',  onClickHandler);
    
    function logger(sentRequests, status) {
        results.innerText += `request index: ${sentRequests}, status: ${status}\n\r`;
    }
})();



