using Fatura.Server.Services;

namespace Fatura.Server.IoC
{
    public static class DependencyInjectionServices
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            services.AddScoped<ICompraService, CompraService>();
            services.AddScoped<ICompraRecorrenteService, CompraRecorrenteService>();
            services.AddScoped<IFaturaService, FaturaService>();
            services.AddScoped<IFornecedorService, FornecedorService>();
            services.AddScoped<ISimulacaoService, SimulacaoService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IInstituicaoFinanceiraService, InstituicaoFinanceiraService>();
            services.AddScoped<IContaFinanceiraService, ContaFinanceiraService>();
            services.AddScoped<ICategoriaService, CategoriaService>();
            services.AddScoped<ISubcategoriaService, SubcategoriaService>();
            services.AddScoped<ILancamentoFinanceiroService, LancamentoFinanceiroService>();
            services.AddScoped<ILembretePagamentoService, LembretePagamentoService>();
            services.AddScoped<ILembretePagamentoProcessamentoService, LembretePagamentoProcessamentoService>();
            services.AddScoped<IEmailService, SmtpEmailService>();

            return services;
        }
    }
}
