/*
 *  Copyright 2021 qitoi
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import * as React from 'react';
import { Box, Grid } from '@chakra-ui/react';

import { compareScreenshotInfo, getScreenshotKey, ImageDataUrl, ScreenshotInfo } from '../../../lib/types';
import * as storage from '../../../lib/storage';
import { useDispatch, useSelector } from '../../store';
import useParameterizedSelector from '../../hooks/useParameterizedSelector';
import SelectedScreenshotList from '../selectedScreenshot/SelectedScreenshotList';
import { selectActiveVideo } from '../activeVideo/activeVideoSlice';
import { fetchScreenshotList, selectScreenshotList } from './screenshotSlice';
import {
    removeSelectedScreenshot,
    selectSelectedScreenshot,
    toggleSelectedScreenshot,
} from '../selectedScreenshot/selectedScreenshotSlice';
import { selectThumbnailPreferences } from '../preferences/preferencesSlice';
import { ScreenshotCard } from './ScreenshotCard';
import { CustomLightbox } from '../../components/CustomLightbox';

export default function ScreenshotList() {
    const dispatch = useDispatch();
    const video = useSelector(selectActiveVideo);
    const screenshots = useParameterizedSelector(selectScreenshotList, video?.platform ?? '', video?.videoId ?? '');
    const selected = useSelector(selectSelectedScreenshot);
    const [selectedHeight, setSelectedHeight] = React.useState<number>(0);
    const thumbnailPreferences = useSelector(selectThumbnailPreferences);
    const [imageViewIndex, setImageViewIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (video !== null) {
            dispatch(fetchScreenshotList({ platform: video.platform, videoId: video.videoId }));
        }
    }, [video]);

    const handleClickScreenshot = React.useCallback((info: ScreenshotInfo, thumbnail: ImageDataUrl) => {
        dispatch(toggleSelectedScreenshot({ info, thumbnail }));
    }, []);

    const handleExpandScreenshot = React.useCallback((info: ScreenshotInfo) => {
        const cur = screenshots.findIndex(s => compareScreenshotInfo(s, info));
        setImageViewIndex(cur);
    }, [screenshots]);

    const handleRemoveSelected = React.useCallback((info: ScreenshotInfo) => {
        dispatch(removeSelectedScreenshot({ info }));
    }, []);

    const handleSelectedResize = React.useCallback((width, height) => {
        setSelectedHeight(height);
    }, []);

    const getKey = React.useCallback((s: ScreenshotInfo) => getScreenshotKey(s), []);
    const loadImage = React.useCallback((s: ScreenshotInfo) => storage.getScreenshot(s.platform, s.videoId, s.no), []);
    const handleLightboxClose = React.useCallback(() => setImageViewIndex(null), []);

    return (
        <Box w="100%" h="100%" minH="100%">
            <Grid
                w="100%"
                minH={`calc(100% - 1rem - ${selectedHeight}px)`}
                p="1rem 1rem 0 1rem"
                templateColumns={`repeat(auto-fill, minmax(${thumbnailPreferences.width}px, 1fr))`}
                autoRows="min-content"
                gap={2}>
                {video !== null && screenshots.map(s => (
                    <ScreenshotCard
                        key={getScreenshotKey(s)}
                        info={s}
                        disabled={video.private}
                        isChecked={selected.some(ss => compareScreenshotInfo(ss, s))}
                        onClick={handleClickScreenshot}
                        onExpandClick={handleExpandScreenshot} />
                ))}
            </Grid>
            <Box h="1rem" />
            {video !== null && (
                <SelectedScreenshotList
                    video={video}
                    screenshots={selected}
                    onResize={handleSelectedResize}
                    onClick={handleRemoveSelected} />
            )}
            {video !== null && imageViewIndex !== null && (
                <CustomLightbox
                    list={screenshots}
                    index={imageViewIndex}
                    getKey={getKey}
                    loadImage={loadImage}
                    onClose={handleLightboxClose} />
            )}
        </Box>
    );
}
