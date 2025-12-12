/**
 * SVG Parameter Updater Utility
 * Use this script in your React/JavaScript application to update SVG parameters in real-time
 */

class SvgParameterUpdater {
    constructor(svgElement) {
        this.svgElement = svgElement;
        this.parameterCache = {};
    }

    updateParameter(paramName, value) {
        this.parameterCache[paramName] = value;
        this.updateSvg();
    }

    updateParameters(parameters) {
        Object.assign(this.parameterCache, parameters);
        this.updateSvg();
    }

    updateSvg() {
        this.updateGradientLevels();
        this.updateTextElements();
        this.updateFillColors();
        this.updateStrokeColors();
    }

    updateGradientLevels() {
        const gradientElements = this.svgElement.querySelectorAll('[data-scada-type="gradient-level"]');

        gradientElements.forEach(element => {
            const paramName = element.getAttribute('data-scada-param');
            const value = this.parameterCache[paramName];

            if (value === undefined) return;

            const min = parseFloat(element.getAttribute('data-scada-min') || 0);
            const max = parseFloat(element.getAttribute('data-scada-max') || 100);
            const direction = element.getAttribute('data-scada-direction') || 'bottom-to-top';

            const percentage = this.calculatePercentage(value, min, max);

            this.updateGradientStops(element, percentage, direction);
        });
    }

    calculatePercentage(value, min, max) {
        if (max === min) return 0;
        const percentage = ((value - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, percentage));
    }

    updateGradientStops(element, percentage, direction) {
        const fillAttr = element.getAttribute('fill');

        if (!fillAttr || !fillAttr.startsWith('url(#')) {
            return;
        }

        const gradientId = fillAttr.substring(5, fillAttr.length - 1);
        const gradient = this.svgElement.querySelector(`#${gradientId}`);

        if (!gradient) return;

        const stops = gradient.querySelectorAll('stop');
        const transitionStop = Array.from(stops).find(stop =>
            stop.getAttribute('data-scada-stop') === 'transition'
        );
        const emptyStops = Array.from(stops).filter(stop =>
            stop.getAttribute('data-scada-stop') === 'empty'
        );

        if (transitionStop && emptyStops.length > 0) {
            transitionStop.setAttribute('offset', `${percentage}%`);
            emptyStops[0].setAttribute('offset', `${percentage}%`);
        }
    }

    updateTextElements() {
        const textElements = this.svgElement.querySelectorAll('[data-scada-type="text"]');

        textElements.forEach(element => {
            const paramName = element.getAttribute('data-scada-param');
            const value = this.parameterCache[paramName];

            if (value !== undefined) {
                this.updateTextContent(element, value);
            }
        });
    }

    updateTextContent(element, value) {
        if (element.tagName === 'text' || element.tagName === 'tspan') {
            element.textContent = value;
        } else {
            const textNodes = element.querySelectorAll('text, tspan');
            textNodes.forEach(node => {
                node.textContent = value;
            });
        }
    }

    updateFillColors() {
        const fillColorElements = this.svgElement.querySelectorAll('[data-scada-type="fill-color"]');

        fillColorElements.forEach(element => {
            const paramName = element.getAttribute('data-scada-param');
            const value = this.parameterCache[paramName];

            if (value !== undefined) {
                element.setAttribute('fill', value);
            }
        });
    }

    updateStrokeColors() {
        const strokeColorElements = this.svgElement.querySelectorAll('[data-scada-type="stroke-color"]');

        strokeColorElements.forEach(element => {
            const paramName = element.getAttribute('data-scada-param');
            const value = this.parameterCache[paramName];

            if (value !== undefined) {
                element.setAttribute('stroke', value);
            }
        });
    }

    getAllParameters() {
        const parameters = new Set();

        this.svgElement.querySelectorAll('[data-scada-param]').forEach(element => {
            const paramName = element.getAttribute('data-scada-param');
            if (paramName) {
                parameters.add(paramName);
            }
        });

        return Array.from(parameters);
    }

    getParameterMetadata(paramName) {
        const elements = this.svgElement.querySelectorAll(`[data-scada-param="${paramName}"]`);

        if (elements.length === 0) return null;

        const element = elements[0];
        const type = element.getAttribute('data-scada-type');

        const metadata = {
            paramName: paramName,
            type: type,
            elementCount: elements.length
        };

        if (type === 'gradient-level') {
            metadata.min = parseFloat(element.getAttribute('data-scada-min') || 0);
            metadata.max = parseFloat(element.getAttribute('data-scada-max') || 100);
            metadata.direction = element.getAttribute('data-scada-direction') || 'bottom-to-top';
            metadata.fillColor = element.getAttribute('data-scada-fill-color') || '#0066cc';
            metadata.emptyColor = element.getAttribute('data-scada-empty-color') || '#e0e0e0';
        }

        return metadata;
    }

    reset() {
        this.parameterCache = {};
        this.updateSvg();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SvgParameterUpdater;
}

if (typeof window !== 'undefined') {
    window.SvgParameterUpdater = SvgParameterUpdater;
}
