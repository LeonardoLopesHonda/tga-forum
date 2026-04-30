from db.database import get_db, Profile

def populate_profile(id: str, username: str):
    db = next(get_db())
    profile = Profile(
        id=id,
        username=username
    )
    db.add(profile)
    db.commit()