import bisect
from fastapi import HTTPException, status
from gs.backend.data.data_wrappers.wrappers import AROUsersWrapper
from gs.backend.data.tables.aro_user_tables import AROUsers, AROUserCallsigns

from gs.backend.data.resources.callsigns import callsigns

def search_callsign(callsign: str, callsigns: list[AROUserCallsigns]) -> bool | int:
    """
    Uses binary search to find if the callsign exists.
    
    :callsign str
    :callsigns list[AROUserCallsigns]

    binary search in the big 26 =( bills can't be this high
    """
    start = 0
    end = len(callsigns) - 1

    while(start <= end):
        mid = (start + end) // 2
        if (callsign == callsigns[mid].call_sign):
            return [True, mid]
        
        if (callsign < callsigns[mid].call_sign):
            end = mid - 1
        else:
            start = mid + 1

    return [False, -1]

def callsign_verified(*callsign_args: tuple[str]) -> bool:
    """
    callsign_verified 的 Docstring
    
    Checks call_sign against the government CSV file.

    TODO: Inquire about any further specifications before return
    TODO: Use % matching on callsigns instead of hardcoded methods
    """
    callsign_csv = callsigns()
    callsign_found, callsign_index = search_callsign(callsign_args[0], callsign_csv)

    expected_levels = [
        callsign_csv[callsign_index].qual_level_a,
        callsign_csv[callsign_index].qual_level_b,
        callsign_csv[callsign_index].qual_level_c,
        callsign_csv[callsign_index].qual_level_d,
        callsign_csv[callsign_index].qual_level_e,
    ]
    
    for i, expected in enumerate(expected_levels):
        if (callsign_args[i+1] != expected):
            print('\033[1;31m' + "WARNING!" + '\033[0m' + 
                  "Mismatch at qual_level_" + chr(ord('a') + i) + ", index", callsign_index, "of callsigns().")

    return callsign_found

def verify_user_callsign(*callsign_args: tuple[str], user: AROUsers) -> AROUsers:
    # callsign_args is a tuple!
    # -> (callsign, qual_level_a, qual_level_b, qual_level_c, qual_level_d, qual_level_e, user)

    # I do not expect any keyword arguments, we should NOT be editing these variables anyways
    if not callsign_verified(callsign_args):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Callsign unable to be verified."
        )

    users = AROUsersWrapper()
    updated_user = users.update(user.id, {
        "callsign" : callsign_args[0],
        "is_callsign_verified" : True,
    })

    return updated_user
