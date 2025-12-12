/**
 * Supabase Integration for SCADA Parameter Mapping
 * Handles saving and loading parameter mapping templates
 */

(function() {
    'use strict';

    const SupabaseIntegration = {
        supabase: null,

        init: function() {
            const supabaseUrl = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

            if (typeof supabase !== 'undefined' && supabase.createClient) {
                this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
                console.log('Supabase initialized for SCADA templates');
            } else {
                console.log('Supabase client not loaded. Template sync disabled.');
            }
        },

        async saveTemplate(name, description, category, mappingConfig, previewSvg) {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                return { error: 'Database not available' };
            }

            try {
                const { data: user } = await this.supabase.auth.getUser();

                if (!user || !user.user) {
                    return { error: 'User not authenticated' };
                }

                const { data, error } = await this.supabase
                    .from('scada_templates')
                    .insert([
                        {
                            name: name,
                            description: description,
                            category: category,
                            mapping_config: mappingConfig,
                            preview_svg: previewSvg,
                            created_by: user.user.id,
                            is_public: false
                        }
                    ])
                    .select();

                if (error) {
                    console.error('Error saving template:', error);
                    return { error: error.message };
                }

                return { data: data[0] };
            } catch (err) {
                console.error('Exception saving template:', err);
                return { error: err.message };
            }
        },

        async loadTemplates(category = null) {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                return { error: 'Database not available' };
            }

            try {
                const { data: user } = await this.supabase.auth.getUser();

                let query = this.supabase
                    .from('scada_templates')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (category) {
                    query = query.eq('category', category);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error loading templates:', error);
                    return { error: error.message };
                }

                return { data: data || [] };
            } catch (err) {
                console.error('Exception loading templates:', err);
                return { error: err.message };
            }
        },

        async updateTemplate(id, updates) {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                return { error: 'Database not available' };
            }

            try {
                const { data, error } = await this.supabase
                    .from('scada_templates')
                    .update(updates)
                    .eq('id', id)
                    .select();

                if (error) {
                    console.error('Error updating template:', error);
                    return { error: error.message };
                }

                return { data: data[0] };
            } catch (err) {
                console.error('Exception updating template:', err);
                return { error: err.message };
            }
        },

        async deleteTemplate(id) {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                return { error: 'Database not available' };
            }

            try {
                const { error } = await this.supabase
                    .from('scada_templates')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting template:', error);
                    return { error: error.message };
                }

                return { success: true };
            } catch (err) {
                console.error('Exception deleting template:', err);
                return { error: err.message };
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            SupabaseIntegration.init();
        });
    } else {
        SupabaseIntegration.init();
    }

    window.ScadaSupabaseIntegration = SupabaseIntegration;
})();
