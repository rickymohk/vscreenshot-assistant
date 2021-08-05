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
import { chakra, Box, Checkbox, Fade, HStack, Spacer } from '@chakra-ui/react';
import { MdFullscreen } from 'react-icons/md';

import { ImageDataUrl, ScreenshotInfo } from '../../../lib/types';
import LazyLoadScreenshotThumbnail from './LazyLoadScreenshotThumbnail';


type ScreenshotCardProps = React.PropsWithChildren<{
    info: ScreenshotInfo,
    isChecked: boolean,
    disabled: boolean,
    onClick: (info: ScreenshotInfo, thumbnail: ImageDataUrl) => void,
    onExpandClick: (info: ScreenshotInfo) => void,
}>;

const ScreenshotCard = ({ info, isChecked, disabled, onClick, onExpandClick }: ScreenshotCardProps) => {
    const [isShown, setIsShown] = React.useState<boolean>(false);
    const [isClickable, setIsClickable] = React.useState<boolean>(false);
    const ref = React.useRef<HTMLImageElement>(null);
    const [visible, setVisible] = React.useState<boolean>(false);

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement & HTMLButtonElement>) => {
        e.preventDefault();
        if (isClickable && !disabled && ref.current !== null) {
            onClick(info, ref.current.src);
        }
    }, [info, disabled, onClick, isClickable]);

    const handleExpandClick = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onExpandClick(info);
    }, [info, onExpandClick]);

    const handleLoad = React.useCallback(() => {
        setIsClickable(true);
    }, []);

    const handleVisible = React.useCallback(() => {
        setVisible(true);
    }, []);

    const handleMouseOver = React.useCallback(() => {
        setIsShown(true);
    }, []);

    const handleMouseOut = React.useCallback(() => {
        setIsShown(false);
    }, []);

    return (
        <chakra.div w="100%"
                    display={visible ? undefined : 'none'}
                    position="relative"
                    rounded="md"
                    overflow="clip"
                    onClick={handleClick}
                    cursor={disabled ? 'default' : 'pointer'}
                    onMouseEnter={handleMouseOver}
                    onMouseLeave={handleMouseOut}
                    onMouseMove={handleMouseOver}>
            <LazyLoadScreenshotThumbnail
                ref={ref}
                platform={info.platform}
                videoId={info.videoId}
                no={info.no}
                onLoad={handleLoad}
                onVisible={handleVisible} />
            <Fade in={isShown || isChecked}>
                <Box w="100%" h="100%" position="absolute" top={0} left={0} bgColor="rgba(0, 0, 0, 0.5)" />
            </Fade>
            <Fade in={isShown}>
                <HStack w="100%" position="absolute" bottom={0} left={0} spacing={0} bgColor="rgba(0, 0, 0, 0)">
                    <Spacer />
                    <Box p={1}
                         cursor="pointer"
                         onClick={handleExpandClick}
                         transition="transform 0.05s ease-out"
                         _hover={{ transform: 'scale(1.2)' }}>
                        <MdFullscreen color="white" size="2rem" />
                    </Box>
                </HStack>
            </Fade>
            {!disabled && <Checkbox isChecked={isChecked} position="absolute" p={1} top={0} left={0} />}
        </chakra.div>
    );
};

export default React.memo(ScreenshotCard);
