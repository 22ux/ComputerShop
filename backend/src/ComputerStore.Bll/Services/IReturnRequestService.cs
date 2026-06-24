using ComputerStore.Bll.Dtos;

namespace ComputerStore.Bll.Services;

public interface IReturnRequestService
{
    Task<ReturnRequestDto> CreateRequestAsync(int userId, CreateReturnRequestDto requestDto, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReturnRequestDto>> GetMyRequestsAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReturnRequestDto>> GetAllRequestsAsync(CancellationToken cancellationToken = default);
    Task<ReturnRequestDto> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default);
    Task<ReturnRequestDto> ProcessExchangeAsync(int id, ProcessExchangeDto requestDto, CancellationToken cancellationToken = default);
}
