/**
 * SCADA Parameter Mapping Extension for draw.io
 * Allows users to map placeholders to gradients and text for real-time SCADA visualization
 */

(function() {
    'use strict';

    const ParameterMapping = {
        mappings: {},

        init: function() {
            console.log('Initializing SCADA Parameter Mapping Extension...');

            if (typeof window.EditorUi !== 'undefined') {
                this.injectEditorHooks();
            } else {
                setTimeout(() => this.init(), 500);
            }
        },

        injectEditorHooks: function() {
            const self = this;

            if (window.EditorUi && window.EditorUi.prototype) {
                const originalInit = window.EditorUi.prototype.init;

                window.EditorUi.prototype.init = function() {
                    originalInit.apply(this, arguments);
                    self.setupClickHandlers(this);
                    self.extendContextMenu(this);
                    self.extendSvgExport(this);
                    self.loadMappingsFromDiagram(this);
                };
            }
        },

        setupClickHandlers: function(editorUi) {
            const self = this;
            const graph = editorUi.editor.graph;

            graph.addListener(mxEvent.CLICK, function(sender, evt) {
                const cell = evt.getProperty('cell');

                if (cell && !graph.isSelectionEmpty() && mxEvent.isControlDown(evt.getProperty('event'))) {
                    self.showParameterMappingDialog(editorUi, cell);
                }
            });
        },

        extendContextMenu: function(editorUi) {
            const self = this;
            const graph = editorUi.editor.graph;

            if (window.mxPopupMenuHandler) {
                const originalCreatePopupMenu = graph.popupMenuHandler.createPopupMenu;

                graph.popupMenuHandler.createPopupMenu = function(menu, cell, evt) {
                    originalCreatePopupMenu.apply(this, arguments);

                    if (cell) {
                        menu.addSeparator();
                        menu.addItem('Set Parameter Mapping...', null, function() {
                            self.showParameterMappingDialog(editorUi, cell);
                        });

                        if (self.mappings[cell.id]) {
                            menu.addItem('Remove Parameter Mapping', null, function() {
                                delete self.mappings[cell.id];
                                self.saveMappingsToDiagram(editorUi);
                                editorUi.editor.setModified(true);
                            });
                        }
                    }
                };
            }
        },

        showParameterMappingDialog: function(editorUi, cell) {
            const self = this;
            const existingMapping = this.mappings[cell.id] || {};
            const graph = editorUi.editor.graph;
            const style = graph.getCellStyle(cell);
            const isText = graph.getModel().isVertex(cell) && cell.value;

            const hasGradient = style.fillColor &&
                               (style.fillColor.indexOf('gradient') !== -1 ||
                                style.gradientColor ||
                                style.gradientDirection);

            const div = document.createElement('div');
            div.className = 'scada-param-dialog';
            div.innerHTML = `
                <div class="scada-param-overlay" id="scadaParamOverlay"></div>
                <div class="scada-param-modal">
                    <div class="scada-param-header">
                        <h3>SCADA Parameter Mapping</h3>
                        <button class="scada-param-close" id="scadaParamClose">&times;</button>
                    </div>
                    <div class="scada-param-body">
                        <div class="scada-param-field">
                            <label for="paramName">Parameter Name (Placeholder):</label>
                            <input type="text" id="paramName" placeholder="e.g., TANK_01_LEVEL or MB_40001"
                                   value="${existingMapping.paramName || ''}" />
                            <small>This will be used as a placeholder in the exported SVG</small>
                        </div>

                        <div class="scada-param-field">
                            <label for="paramType">Parameter Type:</label>
                            <select id="paramType">
                                <option value="text" ${existingMapping.type === 'text' ? 'selected' : ''}>Text Content</option>
                                <option value="gradient-level" ${existingMapping.type === 'gradient-level' ? 'selected' : ''}>Gradient Level Indicator</option>
                                <option value="fill-color" ${existingMapping.type === 'fill-color' ? 'selected' : ''}>Fill Color</option>
                                <option value="stroke-color" ${existingMapping.type === 'stroke-color' ? 'selected' : ''}>Stroke Color</option>
                            </select>
                        </div>

                        <div id="gradientConfig" class="scada-param-field" style="display: ${existingMapping.type === 'gradient-level' ? 'block' : 'none'}">
                            <h4>Gradient Level Configuration</h4>

                            <div class="scada-param-field">
                                <label for="gradientDirection">Fill Direction:</label>
                                <select id="gradientDirection">
                                    <option value="bottom-to-top" ${existingMapping.gradientDirection === 'bottom-to-top' ? 'selected' : ''}>Bottom to Top</option>
                                    <option value="top-to-bottom" ${existingMapping.gradientDirection === 'top-to-bottom' ? 'selected' : ''}>Top to Bottom</option>
                                    <option value="left-to-right" ${existingMapping.gradientDirection === 'left-to-right' ? 'selected' : ''}>Left to Right</option>
                                    <option value="right-to-left" ${existingMapping.gradientDirection === 'right-to-left' ? 'selected' : ''}>Right to Left</option>
                                </select>
                            </div>

                            <div class="scada-param-field">
                                <label for="minValue">Minimum Value:</label>
                                <input type="number" id="minValue" value="${existingMapping.minValue || 0}" />
                            </div>

                            <div class="scada-param-field">
                                <label for="maxValue">Maximum Value:</label>
                                <input type="number" id="maxValue" value="${existingMapping.maxValue || 100}" />
                            </div>

                            <div class="scada-param-field">
                                <label for="fillColor">Fill Color:</label>
                                <input type="color" id="fillColor" value="${existingMapping.fillColor || '#0066cc'}" />
                            </div>

                            <div class="scada-param-field">
                                <label for="emptyColor">Empty Color:</label>
                                <input type="color" id="emptyColor" value="${existingMapping.emptyColor || '#e0e0e0'}" />
                            </div>
                        </div>

                        <div class="scada-param-preview">
                            <h4>Placeholder Preview:</h4>
                            <code id="placeholderPreview">{{${existingMapping.paramName || 'PARAM_NAME'}}}</code>
                        </div>
                    </div>
                    <div class="scada-param-footer">
                        <button class="scada-param-btn scada-param-btn-cancel" id="scadaParamCancel">Cancel</button>
                        <button class="scada-param-btn scada-param-btn-save" id="scadaParamSave">Save Mapping</button>
                    </div>
                </div>
            `;

            document.body.appendChild(div);

            const paramTypeSelect = document.getElementById('paramType');
            const gradientConfig = document.getElementById('gradientConfig');
            const paramNameInput = document.getElementById('paramName');
            const placeholderPreview = document.getElementById('placeholderPreview');

            paramTypeSelect.addEventListener('change', function() {
                gradientConfig.style.display = this.value === 'gradient-level' ? 'block' : 'none';
            });

            paramNameInput.addEventListener('input', function() {
                placeholderPreview.textContent = `{{${this.value || 'PARAM_NAME'}}}`;
            });

            document.getElementById('scadaParamClose').addEventListener('click', function() {
                document.body.removeChild(div);
            });

            document.getElementById('scadaParamOverlay').addEventListener('click', function() {
                document.body.removeChild(div);
            });

            document.getElementById('scadaParamCancel').addEventListener('click', function() {
                document.body.removeChild(div);
            });

            document.getElementById('scadaParamSave').addEventListener('click', function() {
                const mapping = {
                    cellId: cell.id,
                    paramName: document.getElementById('paramName').value,
                    type: document.getElementById('paramType').value
                };

                if (mapping.type === 'gradient-level') {
                    mapping.gradientDirection = document.getElementById('gradientDirection').value;
                    mapping.minValue = parseFloat(document.getElementById('minValue').value);
                    mapping.maxValue = parseFloat(document.getElementById('maxValue').value);
                    mapping.fillColor = document.getElementById('fillColor').value;
                    mapping.emptyColor = document.getElementById('emptyColor').value;
                }

                if (!mapping.paramName) {
                    alert('Please enter a parameter name');
                    return;
                }

                self.mappings[cell.id] = mapping;
                self.saveMappingsToDiagram(editorUi);
                editorUi.editor.setModified(true);
                document.body.removeChild(div);

                editorUi.editor.graph.refresh();
            });
        },

        saveMappingsToDiagram: function(editorUi) {
            const graph = editorUi.editor.graph;
            const model = graph.getModel();
            const root = model.getRoot();

            if (root) {
                model.beginUpdate();
                try {
                    model.setValue(root, JSON.stringify({
                        scadaMappings: this.mappings
                    }));
                } finally {
                    model.endUpdate();
                }
            }
        },

        loadMappingsFromDiagram: function(editorUi) {
            const graph = editorUi.editor.graph;
            const model = graph.getModel();
            const root = model.getRoot();

            if (root && root.value) {
                try {
                    const data = JSON.parse(root.value);
                    if (data.scadaMappings) {
                        this.mappings = data.scadaMappings;
                    }
                } catch (e) {
                    console.log('No existing mappings found');
                }
            }
        },

        extendSvgExport: function(editorUi) {
            const self = this;

            if (window.mxSvgCanvas2D && window.mxSvgCanvas2D.prototype) {
                const originalCreateSvgElement = window.mxSvgCanvas2D.prototype.createSvgElement;

                window.mxSvgCanvas2D.prototype.createSvgElement = function(tagName, namespace) {
                    const elem = originalCreateSvgElement.apply(this, arguments);

                    if (this.state && this.state.cell) {
                        const cellId = this.state.cell.id;
                        const mapping = self.mappings[cellId];

                        if (mapping) {
                            elem.setAttribute('data-scada-param', mapping.paramName);
                            elem.setAttribute('data-scada-type', mapping.type);

                            if (mapping.type === 'gradient-level') {
                                elem.setAttribute('data-scada-direction', mapping.gradientDirection);
                                elem.setAttribute('data-scada-min', mapping.minValue);
                                elem.setAttribute('data-scada-max', mapping.maxValue);
                                elem.setAttribute('data-scada-fill-color', mapping.fillColor);
                                elem.setAttribute('data-scada-empty-color', mapping.emptyColor);

                                if (tagName === 'rect' || tagName === 'path' || tagName === 'ellipse') {
                                    const gradientId = 'scada-gradient-' + cellId;
                                    self.createGradientDefinition(elem, gradientId, mapping);
                                    elem.setAttribute('fill', 'url(#' + gradientId + ')');
                                }
                            } else if (mapping.type === 'text') {
                                if (tagName === 'text' || tagName === 'tspan') {
                                    elem.textContent = `{{${mapping.paramName}}}`;
                                }
                            }
                        }
                    }

                    return elem;
                };
            }
        },

        createGradientDefinition: function(elem, gradientId, mapping) {
            const svg = elem.ownerDocument.querySelector('svg');
            if (!svg) return;

            let defs = svg.querySelector('defs');
            if (!defs) {
                defs = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'defs');
                svg.insertBefore(defs, svg.firstChild);
            }

            const gradient = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);

            switch (mapping.gradientDirection) {
                case 'bottom-to-top':
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '100%');
                    gradient.setAttribute('x2', '0%');
                    gradient.setAttribute('y2', '0%');
                    break;
                case 'top-to-bottom':
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '0%');
                    gradient.setAttribute('y2', '100%');
                    break;
                case 'left-to-right':
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '100%');
                    gradient.setAttribute('y2', '0%');
                    break;
                case 'right-to-left':
                    gradient.setAttribute('x1', '100%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '0%');
                    gradient.setAttribute('y2', '0%');
                    break;
            }

            const stop1 = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', mapping.fillColor);
            stop1.setAttribute('data-scada-stop', 'fill');

            const stop2 = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('stop-color', mapping.fillColor);
            stop2.setAttribute('data-scada-stop', 'transition');
            stop2.setAttribute('data-scada-param-offset', `{{${mapping.paramName}}}`);

            const stop3 = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop3.setAttribute('offset', '50%');
            stop3.setAttribute('stop-color', mapping.emptyColor);
            stop3.setAttribute('data-scada-stop', 'empty');

            const stop4 = elem.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop4.setAttribute('offset', '100%');
            stop4.setAttribute('stop-color', mapping.emptyColor);
            stop4.setAttribute('data-scada-stop', 'empty');

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            gradient.appendChild(stop3);
            gradient.appendChild(stop4);

            defs.appendChild(gradient);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ParameterMapping.init();
        });
    } else {
        ParameterMapping.init();
    }

    window.ScadaParameterMapping = ParameterMapping;
})();
