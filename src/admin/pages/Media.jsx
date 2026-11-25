import React from 'react';
import { PageHead } from '../ui';
import MediaLibrary from '../MediaLibrary';

export default function Media() {
    return (
        <>
            <PageHead kicker="EVIDENCE LOCKER" title="Media Library" />
            <MediaLibrary />
        </>
    );
}
