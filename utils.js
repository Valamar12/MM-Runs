function extractRunId(url) {
    const parts = url.split('/');
    return parts[parts.length - 1].split('-')[0];
}