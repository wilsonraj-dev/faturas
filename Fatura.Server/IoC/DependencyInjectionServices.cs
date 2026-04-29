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

            return services;
        }
    }
}
