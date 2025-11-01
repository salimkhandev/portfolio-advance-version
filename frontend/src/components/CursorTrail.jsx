import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * @typedef {Object} ColorPreset
 * @property {string} primary - Primary color with opacity
 * @property {string} secondary - Secondary color with opacity
 * @property {string} shadow - Shadow effect with color and opacity
 */

/**
 * Predefined color presets for the cursor trail effect
 * @type {Object.<string, ColorPreset>}
 */
const COLOR_PRESETS = {
    subtle: {
        primary: 'rgba(180, 210, 255, 0.4)',
        secondary: 'rgba(200, 230, 255, 0.3)',
        shadow: '0 0 8px rgba(180, 210, 255, 0.2)'
    },
    cyber: {
        primary: 'rgba(0, 255, 255, 0.8)',
        secondary: 'rgba(255, 0, 255, 0.6)',
        shadow: '0 0 15px rgba(0, 255, 255, 0.7)'
    },
    lava: {
        primary: 'rgba(255, 80, 0, 0.8)',
        secondary: 'rgba(255, 200, 0, 0.6)',
        shadow: '0 0 20px rgba(255, 100, 0, 0.6)'
    },
    nebula: {
        primary: 'rgba(150, 50, 255, 0.8)',
        secondary: 'rgba(50, 150, 255, 0.6)',
        shadow: '0 0 25px rgba(150, 50, 255, 0.5)'
    }
};

/**
 * CursorTrail Component - Creates an interactive particle trail following the cursor
 * @param {Object} props
 * @param {boolean} [props.active=true] - Enable/disable the cursor trail
 * @param {string} [props.preset="subtle"] - Color preset name
 * @param {number} [props.density=2] - Number of particles per movement
 * @param {[number, number]} [props.sizeRange=[2, 6]] - Min and max particle size
 * @param {boolean} [props.physics=true] - Enable physics simulation
 * @param {number} [props.maxParticles=30] - Maximum number of particles
 * @param {string[]} [props.activationAreas=[]] - CSS selectors for activation areas
 * @param {number} [props.fadeSpeed=0.95] - Particle fade speed (0-1)
 */
const CursorTrail = ({
    active = true,
    preset = "subtle",
    density = 2,
    sizeRange = [2, 6],
    physics = true,
    maxParticles = 30,
    activationAreas = [],
    fadeSpeed = 0.95
}) => {
    const [particles, setParticles] = useState([]);
    const [isInActiveArea, setIsInActiveArea] = useState(activationAreas.length === 0);
    const frameRef = useRef();
    const lastPos = useRef({ x: 0, y: 0 });
    const isEnabledRef = useRef(active);

    // Memoize colors to prevent unnecessary recalculations
    const currentColors = useMemo(() => COLOR_PRESETS[preset] || COLOR_PRESETS.subtle, [preset]);

    useEffect(() => {
        isEnabledRef.current = active;
    }, [active]);

    const checkActiveAreas = useCallback((e) => {
        if (activationAreas.length === 0) {
            setIsInActiveArea(true);
            return true;
        }

        const elements = activationAreas.map(selector => 
            Array.from(document.querySelectorAll(selector))
        ).flat();
        
        const isOver = elements.some(el => {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );
        });

        setIsInActiveArea(isOver);
        return isOver;
    }, [activationAreas]);

    const handleMouseMove = useCallback((e) => {
        if (!isEnabledRef.current || (activationAreas.length > 0 && !checkActiveAreas(e))) {
            return;
        }

        const velocity = physics ? {
            x: e.clientX - lastPos.current.x,
            y: e.clientY - lastPos.current.y
        } : { x: 0, y: 0 };

        lastPos.current = { x: e.clientX, y: e.clientY };

        if (Math.abs(velocity.x) < 0.2 && Math.abs(velocity.y) < 0.2 && physics) {
            return;
        }

        const speedFactor = physics ? 
            Math.min(1, Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) / 10) : 1;
        const currentDensity = Math.max(1, Math.round(density * speedFactor));

        const newParticles = Array.from({ length: currentDensity }).map((_, i) => ({
            id: `${Date.now()}-${Math.random()}-${i}`,
            x: e.clientX + (Math.random() * 20 - 10),
            y: e.clientY + (Math.random() * 20 - 10),
            size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
            opacity: 0.8 + Math.random() * 0.2,
            velocity: {
                x: velocity.x * 0.2 + (Math.random() * 2 - 1),
                y: velocity.y * 0.2 + (Math.random() * 2 - 1)
            },
            life: 100
        }));

        setParticles(prev => [...prev.slice(-(maxParticles - currentDensity)), ...newParticles]);
    }, [physics, density, sizeRange, maxParticles, activationAreas, checkActiveAreas]);

    const updateParticles = useCallback(() => {
        setParticles(prev => {
            return prev
                .map(p => {
                    // Apply physics
                    return {
                        ...p,
                        x: p.x + p.velocity.x,
                        y: p.y + p.velocity.y,
                        velocity: {
                            x: p.velocity.x * 0.95,
                            y: p.velocity.y * 0.95
                        },
                        life: p.life - 2,
                        opacity: p.opacity * fadeSpeed
                    };
                })
                .filter(p => p.life > 0 && p.opacity > 0.05);
        });
        frameRef.current = requestAnimationFrame(updateParticles);
    }, [fadeSpeed]);

    const renderParticle = useCallback((p) => (
        <div
            key={p.id}
            style={{
                position: 'absolute',
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${currentColors.primary}, ${currentColors.secondary})`,
                boxShadow: currentColors.shadow,
                opacity: p.opacity,
                transform: `translate(-50%, -50%) scale(${1 + (1 - p.opacity)})`,
                transition: 'transform 0.05s ease-out, opacity 0.1s ease-out',
                willChange: 'transform, opacity'
            }}
        />
    ), [currentColors]);

    useEffect(() => {
        if (!active) return;

        window.addEventListener('mousemove', handleMouseMove);
        frameRef.current = requestAnimationFrame(updateParticles);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameRef.current);
        };
    }, [active, handleMouseMove, updateParticles]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            {isInActiveArea && particles.map(renderParticle)}
        </div>
    );
};

export default CursorTrail;